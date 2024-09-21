import { cloneRepo, removeRepo } from "../src/metrics/clone_repo";
import { calculateCorrectness } from "../src/metrics/correctness";
import { getGithubInfo, RepoDetails } from "../src/apiProcess/gitApiProcess";

// Mock the necessary modules
jest.mock('isomorphic-git');
jest.mock('isomorphic-git/http/node');
jest.mock('../src/metrics/clone_repo');
jest.mock('../src/apiProcess/gitApiProcess');

const mockedGit = require('isomorphic-git');
const mockedCloneRepo = cloneRepo as jest.Mock;
const mockedGetGithubInfo = getGithubInfo as jest.Mock;

const testRepoUrl = "https://github.com/facebook/react";
let clonedPath: string;
let metric: RepoDetails;

beforeAll(async () => {
  // Mock the cloneRepo function
  
  clonedPath = "/home/shay/a/ko109/461/ECE-461-Project-Repo"; // use project repo path for now, may change later
  mockedCloneRepo.mockResolvedValue(clonedPath);

  // Mock the getGithubInfo function
  metric = {
    contributorsData: [
      { name: "Alice", commits: 50 },
      { name: "Bob", commits: 30 },
      { name: "Charlie", commits: 20 },
    ],
    owner: "facebook",
    repo: "react",
    createdAt: "2013-05-24T16:15:54Z",
    stars: 170000,
    forks: 34000,
    openIssues: 700,
    license: "MIT",
    commitsData: ["commitsData"],
    issuesData: ["1", "2", "3"],
  };
  // mock getGithubInfo to return the value specified in metric
  mockedGetGithubInfo.mockResolvedValue(metric);  

  // Ensure the mocks are working as expected
  expect(clonedPath).not.toBeNull();
  expect(metric).not.toBeNull();
});

afterAll(async () => {
  // Clean up if necessary
  await removeRepo(clonedPath);
});

describe("calculateCorrectness: Mock evaluating react repo", () => {
  it("should calculate correctness for the mocked repository", async () => {
    const correctness = await calculateCorrectness(metric, clonedPath);
    expect(correctness).toBeDefined();
    // Add more assertions based on the expected correctness value
  });

  // Add more test cases as needed
});