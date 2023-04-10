import * as fs from "fs-extra";
import * as path from "node:path";
import pc from 'picocolors';
import { isCancel, log, note, text, spinner, confirm } from "@clack/prompts";
import { dash, sleep } from "radash";

export default class OrionCreate {
  projectName: string;
  projectFolder: string;
  projectPath: string;

  constructor() {
    note(`You choose the easiest way to create a new project`)
  }

  private makePath(...target: string[]) {
    return path.resolve(process.cwd(), ...target);
  }

  private relativePath(rawPath: string) {
    return rawPath.replace(process.cwd(), '').replace(/^\//, '');
  }

  private async useSpinner (startMessage: string, callback: () => Promise<void>, endMessage: string) {
    const spin = spinner()
    spin.start(startMessage);
    await callback();
    await sleep(1000);
    spin.stop(endMessage);
  }
  

  async init () {
    await this.setProjectName();
    await this.createProjectFolder();
    await this.copyTemplateFiles();
    await this.displayNextSteps();
  }

  private async setProjectName () {
    this.projectName = await text({
      message: `What's the name of your project?`,
      placeholder: `Project name`,
      validate(value) {
        if (!value.trim().length) {
          return `You need to specify a name for your package`;
        }
      },
    }) as string

    if (isCancel(this.projectName)) throw `Operation cancelled`;

    this.projectFolder = dash(this.projectName);
    this.projectPath = this.makePath(this.projectFolder);

    log.info(`Ok let's create the ${pc.bgBlue(` ${this.projectName} `)} project`);
  }
  
  private async createProjectFolder () {
    if (fs.existsSync(this.projectPath)) {
      log.warn(`${pc.yellow(this.projectPath)} already exists...`);
      const shouldContinue = await confirm({
        message: `Should we replace it?`,
        initialValue: false
      });

      if (isCancel(shouldContinue)) throw `Operation cancelled`;

      if (!shouldContinue) {
        throw `The target path already exists and won't be replaced`;
      } else {
        await fs.remove(this.projectPath);
      }
    }

    await this.useSpinner(
      `Creating project folder`,
      () => fs.mkdir(this.projectPath),
      `${pc.blue(this.projectPath)} folder created`
    )
  }

  private async copyTemplateFiles () {
    await this.useSpinner(
      `Copying template files`,
      async () => {
        await fs.copy(`${__dirname}/__template__`, this.projectPath);
        await this.createGitIgnoreFile();
      },
      `Following template files have been copied`
    )

    
    const files = [];
    const readdirRecursive = (path: string = this.projectFolder) => {
      fs.readdirSync(path, {
        withFileTypes: true
      }).forEach(x => {
        if (x.isFile()) {
          files.push(`${this.relativePath(path)}/${x.name}`);
        } else {
          readdirRecursive(this.makePath(path, x.name));
        }
      });
    }

    readdirRecursive();
    log.message(files.map(x => pc.blue(x)).join('\n'));
  }

  private async createGitIgnoreFile () {
    const gitIgnoreTemplate = await fs.readFile(`${__dirname}/template/gitignore.txt`, { encoding: 'utf-8' });
    await fs.writeFile(`${this.projectPath}/.gitignore`, gitIgnoreTemplate);
  }

  private async displayNextSteps () {
    log.success(`Your project is ready!`);
    log.message(`Next steps:`);
    log.message([
      `cd ${this.projectFolder}`,
      `npm install`,
    ].map(x => pc.green(x)).join('\n'));
  }
}