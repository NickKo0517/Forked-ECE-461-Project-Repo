// this file has all helpers functions that are used in correctness.ts
import axios from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as util from 'util';
dotenv.config(); // Load environment variables from a .env file into process.env

/* @param owner: string - the owner of the repository
*  @param repo: string - the repository name
*  @returns boolean - if the repository has a test suite
* 
* a helper function that makes an API call to 
* the GitHub API to check if a repository has a test suite
*/
async function _hasTestSuite(owner: string, repo: string): Promise<boolean> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents`;
  const response = await fetch(url);
  const contents = await response.json();

  if (!Array.isArray(contents)) {
    throw new Error('Failed to fetch repository contents');
  }

  const testDirectories = ['test', 'tests', 'spec', '__tests__'];
  const testFiles = ['package.json'];

  for (const item of contents) {
    if (item.type === 'dir' && testDirectories.includes(item.name)) {
      return true;
    }
    if (item.type === 'file' && testFiles.includes(item.name)) {
      const fileResponse = await fetch(item.download_url);
      const fileContents = await fileResponse.text();
      if (item.name === 'package.json' && fileContents.includes('"test"')) {
        return true;
      }
    }
  }
  return false;
}


/* 
*  @param clonedPath: string - the path of the cloned repository
*  @returns string | null - the path of the test folder or null if not found
* */

async function __findTestOrSrc(directoryPath: string, targetFolderName: string): Promise<string | null> {
  let keywrods: string[];

  if(targetFolderName === 'test') {
    keywrods = ['test', 'tests', 'spec', '__tests__'];
  } else if (targetFolderName === 'src') {
    keywrods = ['src', 'source', 'lib', 'app'];
  } else {
    throw new Error('Invalid target folder name, only "test" and "src" are allowed');
  }

  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        return reject(err);
      }
      // scan the directory for the target folder
      for (const file of files) {
        if (file.isDirectory() && keywrods.includes(file.name)) {
          return resolve(path.join(directoryPath, file.name));
        }
      }
      resolve(null);  //return null if target folder is not found
    });
  });
}

async function __countFilesInDirectory(dirPath: string, count: number = 0): Promise<number> {
  // DO NOT "shell out": instead use the path or fs module to do file traversal
  if(fs.existsSync(dirPath)) {
    const filesList = await fs.promises.readdir(dirPath, { withFileTypes: true }); // use readdir (an async method) to prevent blocking event loop
    for(const file of filesList) {
      if(file.isDirectory()) { // if file is a directory, descent into it with recursion and update count
        const subdirPath = path.join(dirPath, file.name);
        count = await __countFilesInDirectory(subdirPath, count);
      } else {
        count++;
      }
    }
  }
  return count;
}

/* @param clonedPath: string - the path of the cloned repository
*  @returns number - the coverage score of the repository
*  walks the directory tree to find test files, assign scores based on the number of test files
* */
const readFile = util.promisify(fs.readFile); // helper that will be used in _getCoverageScore

async function _getCoverageScore(clonedPath: string): Promise<number> {
  if(!fs.existsSync(clonedPath)) {
    throw new Error('Cloned path does not exist');
  }
  // see if the repo has CI/CD setup
  const ciFiles = ['.travis.yml', 'circle.yml', 'Jenkinsfile', 'azure-pipelines.yml', '.github/workflows'];
  let coverageScore = 0;
  // Check for CI/CD configuration files if any of the CI/CD files exist, set coverageScore to 0.8
  for (const ciFile of ciFiles) {
    const ciFilePath = path.join(clonedPath, ciFile);
    if (fs.existsSync(ciFilePath)) {
      coverageScore = 0.8;
      break;
    }
  }

  // find test and src folders
  const [testFolderPath, srcFolderPath] = await Promise.all([ __findTestOrSrc(clonedPath, 'test'),
    __findTestOrSrc(clonedPath, 'src')]);
  

}

/* @param path: string - the path of the repository
*  @returns number - the lint score of the repository
* clone the repo, run the linter, store results to a file,
* parse the results and return the score
* */
function _getLintScore(path: string): number {
  // clone repo with isomorphic-git

  //run linter: and store output to a file
  //parse linter output
  //return score
  return 0;
}

export { _hasTestSuite, _getCoverageScore, _getLintScore };