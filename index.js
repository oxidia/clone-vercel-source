import { mkdir, writeFile } from "fs/promises";
import got from "got";
import ora from "ora";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

config();

function createApi() {
  const baseUrl = "https://api.vercel.com";

  const headers = {
    Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
  };

  return {
    async getProject(name) {
      const url = `${baseUrl}/projects/${name}`;
      const response = await got(url, {
        headers,
      });

      return JSON.parse(response.body);
    },

    async getFileTree(projectId) {
      const url = `${baseUrl}/v6/deployments/${projectId}/files`;
      const response = await got(url, {
        headers,
      });

      return JSON.parse(response.body);
    },

    async getFileContent(deploymentId, fileId) {
      const url = `${baseUrl}/v6/deployments/${deploymentId}/files/${fileId}`;
      const response = await got(url, {
        headers,
      });

      return response.body;
    },
  };
}

const api = createApi();

async function downloadAll(deploymentId, files, destination) {
  for (const file of files) {
    const { name, type, children, uid } = file;

    const fullPath = join(destination, name);

    if (type == "directory") {
      await mkdir(fullPath, { recursive: true });
      await downloadAll(deploymentId, children, fullPath);
    } else {
      const spinner = ora(
        `Downloading\n - directory: ${destination}\n - file: ${name}`
      ).start();
      try {
        const content = await api.getFileContent(deploymentId, uid);
        await writeFile(fullPath, content);
        spinner.stop();
      } catch (error) {
        spinner.stop();
        console.error(error.message);
        break;
      }
    }
  }
}

(async () => {
  try {
    const args = process.argv.slice(2);
    const [projectName, destination = "downloads"] = args;

    const project = await api.getProject(projectName);
    const files = await api.getFileTree(project.targets.production.id);
    const _dirname = dirname(fileURLToPath(import.meta.url));

    await downloadAll(
      project.targets.production.id,
      files,
      join(_dirname, destination)
    );
  } catch (error) {
    console.error(error.message);
  }
})();
