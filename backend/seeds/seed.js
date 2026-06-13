import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Problem from '../models/Problem.js';
import Contest from '../models/Contest.js';
import Achievement from '../models/Achievement.js';
import DailyChallenge from '../models/DailyChallenge.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Problem.deleteMany({}),
      Contest.deleteMany({}),
      Achievement.deleteMany({}),
      DailyChallenge.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      username: 'admin',
      email: 'admin@codequest.io',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
      xp: 5000,
      level: 51,
      streak: 30,
      longestStreak: 45,
      bio: 'Platform administrator',
      problemsSolved: { easy: 50, medium: 30, hard: 15 },
      totalSubmissions: 200,
      acceptedSubmissions: 95,
    });

    const users = await User.create([
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'User@123',
        isVerified: true,
        xp: 1250,
        level: 13,
        streak: 7,
        longestStreak: 14,
        bio: 'Full-stack developer who loves algorithms',
        location: 'San Francisco, CA',
        problemsSolved: { easy: 15, medium: 10, hard: 3 },
        totalSubmissions: 85,
        acceptedSubmissions: 28,
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'User@123',
        isVerified: true,
        xp: 2100,
        level: 22,
        streak: 12,
        longestStreak: 20,
        bio: 'Competitive programmer and ML enthusiast',
        location: 'New York, NY',
        problemsSolved: { easy: 25, medium: 18, hard: 7 },
        totalSubmissions: 150,
        acceptedSubmissions: 50,
      },
      {
        username: 'alex_code',
        email: 'alex@example.com',
        password: 'User@123',
        isVerified: true,
        xp: 800,
        level: 9,
        streak: 3,
        longestStreak: 10,
        bio: 'CS student passionate about DSA',
        problemsSolved: { easy: 12, medium: 5, hard: 1 },
        totalSubmissions: 60,
        acceptedSubmissions: 18,
      },
      {
        username: 'sarah_dev',
        email: 'sarah@example.com',
        password: 'User@123',
        isVerified: true,
        xp: 3200,
        level: 33,
        streak: 21,
        longestStreak: 30,
        bio: 'Senior engineer at a FAANG company',
        location: 'Seattle, WA',
        problemsSolved: { easy: 35, medium: 25, hard: 12 },
        totalSubmissions: 220,
        acceptedSubmissions: 72,
      },
      {
        username: 'mike_rustacean',
        email: 'mike@example.com',
        password: 'User@123',
        isVerified: true,
        xp: 1800,
        level: 19,
        streak: 5,
        longestStreak: 15,
        bio: 'Rust and systems programming enthusiast',
        problemsSolved: { easy: 20, medium: 14, hard: 5 },
        totalSubmissions: 120,
        acceptedSubmissions: 39,
      },
    ]);

    console.log(`Created ${users.length + 1} users`);

    // Create problems
    const problems = await Problem.create([
      {
        title: 'Two Sum',
        slug: 'two-sum',
        description:
          'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice.\n\nReturn the answer in any order.',
        difficulty: 'Easy',
        tags: ['Array', 'Hash Table'],
        constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
        inputFormat: 'First line: space-separated integers (nums)\nSecond line: target integer',
        outputFormat: 'Space-separated indices',
        examples: [
          { input: '2 7 11 15\n9', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
          { input: '3 2 4\n6', output: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
        ],
        testCases: [
          { input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
          { input: '3 2 4\n6', expectedOutput: '1 2', isHidden: false },
          { input: '3 3\n6', expectedOutput: '0 1', isHidden: true },
          { input: '1 5 3 7 2\n9', expectedOutput: '1 3', isHidden: true },
          { input: '-1 -2 -3 -4 -5\n-8', expectedOutput: '2 4', isHidden: true },
        ],
        starterCode: {
          javascript: '// Read input and solve\nconst lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\\n");\nconst nums = lines[0].split(" ").map(Number);\nconst target = parseInt(lines[1]);\n\nfunction twoSum(nums, target) {\n  // Your code here\n}\n\nconsole.log(twoSum(nums, target).join(" "));',
          python: 'nums = list(map(int, input().split()))\ntarget = int(input())\n\ndef two_sum(nums, target):\n    # Your code here\n    pass\n\nresult = two_sum(nums, target)\nprint(*result)',
          cpp: '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}',
          java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code here\n    }\n}',
        },
        hints: ['Think about what complement you need for each number', 'A hash map can help with O(1) lookups'],
        xpReward: 10,
        totalSubmissions: 1250,
        acceptedSubmissions: 890,
        likes: 342,
        order: 1,
        createdBy: admin._id,
      },
      {
        title: 'Reverse a String',
        slug: 'reverse-a-string',
        description: 'Given a string `s`, return the string reversed.\n\nDo not use any built-in reverse functions.',
        difficulty: 'Easy',
        tags: ['String', 'Two Pointers'],
        constraints: '1 <= s.length <= 10^5\ns consists of printable ASCII characters',
        inputFormat: 'A single string s',
        outputFormat: 'The reversed string',
        examples: [
          { input: 'hello', output: 'olleh', explanation: 'Reverse each character' },
          { input: 'CodeQuest', output: 'tseuQedoC', explanation: '' },
        ],
        testCases: [
          { input: 'hello', expectedOutput: 'olleh', isHidden: false },
          { input: 'CodeQuest', expectedOutput: 'tseuQedoC', isHidden: false },
          { input: 'a', expectedOutput: 'a', isHidden: true },
          { input: 'racecar', expectedOutput: 'racecar', isHidden: true },
          { input: 'Ab Cd', expectedOutput: 'dC bA', isHidden: true },
        ],
        starterCode: {
          javascript: 'const s = require("fs").readFileSync("/dev/stdin", "utf8").trim();\n\nfunction reverseString(s) {\n  // Your code here\n}\n\nconsole.log(reverseString(s));',
          python: 's = input()\n\ndef reverse_string(s):\n    # Your code here\n    pass\n\nprint(reverse_string(s))',
        },
        hints: ['Use two pointers from both ends', 'Swap characters moving inward'],
        xpReward: 10,
        totalSubmissions: 950,
        acceptedSubmissions: 780,
        likes: 215,
        order: 2,
        createdBy: admin._id,
      },
      {
        title: 'Valid Parentheses',
        slug: 'valid-parentheses',
        description:
          'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
        difficulty: 'Easy',
        tags: ['Stack', 'String'],
        constraints: '1 <= s.length <= 10^4\ns consists of parentheses only `()[]{}`',
        inputFormat: 'A single string s',
        outputFormat: '"true" or "false"',
        examples: [
          { input: '()', output: 'true', explanation: 'Single pair matches' },
          { input: '()[]{}', output: 'true', explanation: 'All pairs match' },
          { input: '(]', output: 'false', explanation: 'Mismatched brackets' },
        ],
        testCases: [
          { input: '()', expectedOutput: 'true', isHidden: false },
          { input: '()[]{}', expectedOutput: 'true', isHidden: false },
          { input: '(]', expectedOutput: 'false', isHidden: false },
          { input: '([)]', expectedOutput: 'false', isHidden: true },
          { input: '{[]}', expectedOutput: 'true', isHidden: true },
          { input: '', expectedOutput: 'true', isHidden: true },
        ],
        starterCode: {
          javascript: 'const s = require("fs").readFileSync("/dev/stdin", "utf8").trim();\n\nfunction isValid(s) {\n  // Your code here\n}\n\nconsole.log(isValid(s));',
          python: 's = input()\n\ndef is_valid(s):\n    # Your code here\n    pass\n\nprint(str(is_valid(s)).lower())',
        },
        hints: ['Use a stack data structure', 'Push opening brackets, pop and compare for closing ones'],
        xpReward: 10,
        totalSubmissions: 1100,
        acceptedSubmissions: 720,
        likes: 280,
        order: 3,
        createdBy: admin._id,
      },
      {
        title: 'Longest Substring Without Repeating Characters',
        slug: 'longest-substring-without-repeating-characters',
        description:
          'Given a string `s`, find the length of the longest substring without repeating characters.',
        difficulty: 'Medium',
        tags: ['String', 'Sliding Window', 'Hash Table'],
        constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces',
        inputFormat: 'A single string s',
        outputFormat: 'An integer — the length of the longest substring',
        examples: [
          { input: 'abcabcbb', output: '3', explanation: 'The answer is "abc", with length 3' },
          { input: 'bbbbb', output: '1', explanation: 'The answer is "b", with length 1' },
          { input: 'pwwkew', output: '3', explanation: 'The answer is "wke", with length 3' },
        ],
        testCases: [
          { input: 'abcabcbb', expectedOutput: '3', isHidden: false },
          { input: 'bbbbb', expectedOutput: '1', isHidden: false },
          { input: 'pwwkew', expectedOutput: '3', isHidden: false },
          { input: '', expectedOutput: '0', isHidden: true },
          { input: 'dvdf', expectedOutput: '3', isHidden: true },
          { input: 'anviaj', expectedOutput: '5', isHidden: true },
        ],
        starterCode: {
          javascript: 'const s = require("fs").readFileSync("/dev/stdin", "utf8").trim();\n\nfunction lengthOfLongestSubstring(s) {\n  // Your code here\n}\n\nconsole.log(lengthOfLongestSubstring(s));',
          python: 's = input()\n\ndef length_of_longest_substring(s):\n    # Your code here\n    pass\n\nprint(length_of_longest_substring(s))',
        },
        hints: ['Think about the sliding window technique', 'Use a set or map to track characters in the current window'],
        xpReward: 20,
        totalSubmissions: 880,
        acceptedSubmissions: 410,
        likes: 310,
        order: 4,
        createdBy: admin._id,
      },
      {
        title: 'Merge Two Sorted Lists',
        slug: 'merge-two-sorted-lists',
        description:
          'Given two sorted arrays of integers, merge them into a single sorted array.\n\nReturn the merged sorted array.',
        difficulty: 'Easy',
        tags: ['Array', 'Two Pointers', 'Sorting'],
        constraints: '0 <= arr1.length, arr2.length <= 10^4\n-10^9 <= arr1[i], arr2[i] <= 10^9',
        inputFormat: 'First line: space-separated integers (arr1)\nSecond line: space-separated integers (arr2)',
        outputFormat: 'Space-separated integers of the merged sorted array',
        examples: [
          { input: '1 3 5\n2 4 6', output: '1 2 3 4 5 6', explanation: 'Merge and sort both arrays' },
        ],
        testCases: [
          { input: '1 3 5\n2 4 6', expectedOutput: '1 2 3 4 5 6', isHidden: false },
          { input: '1 2 3\n4 5 6', expectedOutput: '1 2 3 4 5 6', isHidden: false },
          { input: '\n1 2 3', expectedOutput: '1 2 3', isHidden: true },
          { input: '1\n2', expectedOutput: '1 2', isHidden: true },
        ],
        starterCode: {
          javascript: 'const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\\n");\nconst arr1 = lines[0] ? lines[0].split(" ").map(Number) : [];\nconst arr2 = lines[1] ? lines[1].split(" ").map(Number) : [];\n\nfunction mergeSorted(arr1, arr2) {\n  // Your code here\n}\n\nconsole.log(mergeSorted(arr1, arr2).join(" "));',
          python: 'arr1 = list(map(int, input().split())) if True else []\narr2 = list(map(int, input().split())) if True else []\n\ndef merge_sorted(arr1, arr2):\n    # Your code here\n    pass\n\nprint(*merge_sorted(arr1, arr2))',
        },
        hints: ['Use two pointers, one for each array'],
        xpReward: 10,
        totalSubmissions: 700,
        acceptedSubmissions: 560,
        likes: 180,
        order: 5,
        createdBy: admin._id,
      },
      {
        title: 'Maximum Subarray',
        slug: 'maximum-subarray',
        description:
          'Given an integer array `nums`, find the subarray with the largest sum and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.',
        difficulty: 'Medium',
        tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
        constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
        inputFormat: 'Space-separated integers',
        outputFormat: 'A single integer — the maximum subarray sum',
        examples: [
          { input: '-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6' },
          { input: '1', output: '1', explanation: 'Single element' },
          { input: '5 4 -1 7 8', output: '23', explanation: 'The entire array is the max subarray' },
        ],
        testCases: [
          { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false },
          { input: '1', expectedOutput: '1', isHidden: false },
          { input: '5 4 -1 7 8', expectedOutput: '23', isHidden: false },
          { input: '-1', expectedOutput: '-1', isHidden: true },
          { input: '-2 -1', expectedOutput: '-1', isHidden: true },
        ],
        starterCode: {
          javascript: 'const nums = require("fs").readFileSync("/dev/stdin", "utf8").trim().split(" ").map(Number);\n\nfunction maxSubArray(nums) {\n  // Your code here\n}\n\nconsole.log(maxSubArray(nums));',
          python: 'nums = list(map(int, input().split()))\n\ndef max_sub_array(nums):\n    # Your code here\n    pass\n\nprint(max_sub_array(nums))',
        },
        hints: ["Kadane's algorithm is your friend", 'Track the current sum and reset when it goes negative'],
        xpReward: 20,
        totalSubmissions: 920,
        acceptedSubmissions: 480,
        likes: 295,
        order: 6,
        createdBy: admin._id,
      },
      {
        title: 'Binary Search',
        slug: 'binary-search',
        description:
          'Given a sorted array of integers `nums` and an integer `target`, return the index of `target` in `nums`. If `target` is not found, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.',
        difficulty: 'Easy',
        tags: ['Array', 'Binary Search'],
        constraints: '1 <= nums.length <= 10^4\n-10^4 <= nums[i], target <= 10^4\nAll elements in nums are unique\nnums is sorted in ascending order',
        inputFormat: 'First line: space-separated integers (sorted nums)\nSecond line: target integer',
        outputFormat: 'The index, or -1 if not found',
        examples: [
          { input: '-1 0 3 5 9 12\n9', output: '4', explanation: '9 exists at index 4' },
          { input: '-1 0 3 5 9 12\n2', output: '-1', explanation: '2 does not exist' },
        ],
        testCases: [
          { input: '-1 0 3 5 9 12\n9', expectedOutput: '4', isHidden: false },
          { input: '-1 0 3 5 9 12\n2', expectedOutput: '-1', isHidden: false },
          { input: '5\n5', expectedOutput: '0', isHidden: true },
          { input: '1 2 3 4 5\n1', expectedOutput: '0', isHidden: true },
          { input: '1 2 3 4 5\n5', expectedOutput: '4', isHidden: true },
        ],
        starterCode: {
          javascript: 'const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\\n");\nconst nums = lines[0].split(" ").map(Number);\nconst target = parseInt(lines[1]);\n\nfunction binarySearch(nums, target) {\n  // Your code here\n}\n\nconsole.log(binarySearch(nums, target));',
          python: 'nums = list(map(int, input().split()))\ntarget = int(input())\n\ndef binary_search(nums, target):\n    # Your code here\n    pass\n\nprint(binary_search(nums, target))',
        },
        hints: ['Compare target with the middle element', 'Narrow the search space by half each time'],
        xpReward: 10,
        totalSubmissions: 650,
        acceptedSubmissions: 520,
        likes: 190,
        order: 7,
        createdBy: admin._id,
      },
      {
        title: 'Climbing Stairs',
        slug: 'climbing-stairs',
        description:
          'You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        difficulty: 'Easy',
        tags: ['Dynamic Programming', 'Math', 'Memoization'],
        constraints: '1 <= n <= 45',
        inputFormat: 'A single integer n',
        outputFormat: 'A single integer — number of distinct ways',
        examples: [
          { input: '2', output: '2', explanation: '1+1 or 2' },
          { input: '3', output: '3', explanation: '1+1+1, 1+2, 2+1' },
        ],
        testCases: [
          { input: '2', expectedOutput: '2', isHidden: false },
          { input: '3', expectedOutput: '3', isHidden: false },
          { input: '1', expectedOutput: '1', isHidden: true },
          { input: '5', expectedOutput: '8', isHidden: true },
          { input: '10', expectedOutput: '89', isHidden: true },
          { input: '45', expectedOutput: '1836311903', isHidden: true },
        ],
        starterCode: {
          javascript: 'const n = parseInt(require("fs").readFileSync("/dev/stdin", "utf8").trim());\n\nfunction climbStairs(n) {\n  // Your code here\n}\n\nconsole.log(climbStairs(n));',
          python: 'n = int(input())\n\ndef climb_stairs(n):\n    # Your code here\n    pass\n\nprint(climb_stairs(n))',
        },
        hints: ['This is a Fibonacci-like pattern', 'dp[i] = dp[i-1] + dp[i-2]'],
        xpReward: 10,
        totalSubmissions: 800,
        acceptedSubmissions: 640,
        likes: 220,
        order: 8,
        createdBy: admin._id,
      },
      {
        title: 'Container With Most Water',
        slug: 'container-with-most-water',
        description:
          'You are given an integer array `height` of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.',
        difficulty: 'Medium',
        tags: ['Array', 'Two Pointers', 'Greedy'],
        constraints: '2 <= height.length <= 10^5\n0 <= height[i] <= 10^4',
        inputFormat: 'Space-separated integers',
        outputFormat: 'A single integer — the maximum area',
        examples: [
          { input: '1 8 6 2 5 4 8 3 7', output: '49', explanation: 'Lines at index 1 and 8 form the container with area = min(8,7) * (8-1) = 49' },
          { input: '1 1', output: '1', explanation: 'min(1,1) * 1 = 1' },
        ],
        testCases: [
          { input: '1 8 6 2 5 4 8 3 7', expectedOutput: '49', isHidden: false },
          { input: '1 1', expectedOutput: '1', isHidden: false },
          { input: '4 3 2 1 4', expectedOutput: '16', isHidden: true },
          { input: '1 2 1', expectedOutput: '2', isHidden: true },
        ],
        starterCode: {
          javascript: 'const height = require("fs").readFileSync("/dev/stdin", "utf8").trim().split(" ").map(Number);\n\nfunction maxArea(height) {\n  // Your code here\n}\n\nconsole.log(maxArea(height));',
          python: 'height = list(map(int, input().split()))\n\ndef max_area(height):\n    # Your code here\n    pass\n\nprint(max_area(height))',
        },
        hints: ['Two pointers from both ends', 'Move the pointer with the shorter line inward'],
        xpReward: 20,
        totalSubmissions: 750,
        acceptedSubmissions: 380,
        likes: 265,
        order: 9,
        createdBy: admin._id,
      },
      {
        title: 'Trapping Rain Water',
        slug: 'trapping-rain-water',
        description:
          'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
        difficulty: 'Hard',
        tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
        constraints: 'n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5',
        inputFormat: 'Space-separated non-negative integers',
        outputFormat: 'A single integer — total trapped water',
        examples: [
          { input: '0 1 0 2 1 0 1 3 2 1 2 1', output: '6', explanation: 'The elevation map traps 6 units of rain water' },
          { input: '4 2 0 3 2 5', output: '9', explanation: '' },
        ],
        testCases: [
          { input: '0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6', isHidden: false },
          { input: '4 2 0 3 2 5', expectedOutput: '9', isHidden: false },
          { input: '1', expectedOutput: '0', isHidden: true },
          { input: '3 0 3', expectedOutput: '3', isHidden: true },
          { input: '0 0 0', expectedOutput: '0', isHidden: true },
        ],
        starterCode: {
          javascript: 'const height = require("fs").readFileSync("/dev/stdin", "utf8").trim().split(" ").map(Number);\n\nfunction trap(height) {\n  // Your code here\n}\n\nconsole.log(trap(height));',
          python: 'height = list(map(int, input().split()))\n\ndef trap(height):\n    # Your code here\n    pass\n\nprint(trap(height))',
        },
        hints: ['For each position, water trapped = min(maxLeft, maxRight) - height[i]', 'Two pointer approach eliminates extra space'],
        xpReward: 40,
        totalSubmissions: 500,
        acceptedSubmissions: 150,
        likes: 340,
        order: 10,
        createdBy: admin._id,
      },
    ]);

    console.log(`Created ${problems.length} problems`);

    // Achievements
    const achievements = await Achievement.create([
      { name: 'First Steps', description: 'Solve your first problem', icon: '🎯', category: 'problems', tier: 'bronze', requirement: { type: 'problems_solved', value: 1 }, xpReward: 10 },
      { name: 'Problem Solver', description: 'Solve 10 problems', icon: '💡', category: 'problems', tier: 'silver', requirement: { type: 'problems_solved', value: 10 }, xpReward: 25 },
      { name: 'Algorithm Master', description: 'Solve 50 problems', icon: '🧠', category: 'problems', tier: 'gold', requirement: { type: 'problems_solved', value: 50 }, xpReward: 100 },
      { name: 'Code Legend', description: 'Solve 100 problems', icon: '👑', category: 'problems', tier: 'platinum', requirement: { type: 'problems_solved', value: 100 }, xpReward: 250 },
      { name: 'Easy Peasy', description: 'Solve 10 easy problems', icon: '🟢', category: 'problems', tier: 'bronze', requirement: { type: 'easy_solved', value: 10 }, xpReward: 15 },
      { name: 'Medium Rare', description: 'Solve 10 medium problems', icon: '🟡', category: 'problems', tier: 'silver', requirement: { type: 'medium_solved', value: 10 }, xpReward: 30 },
      { name: 'Hard Hitter', description: 'Solve 5 hard problems', icon: '🔴', category: 'problems', tier: 'gold', requirement: { type: 'hard_solved', value: 5 }, xpReward: 50 },
      { name: 'On Fire', description: 'Maintain a 7-day streak', icon: '🔥', category: 'streaks', tier: 'bronze', requirement: { type: 'streak', value: 7 }, xpReward: 20 },
      { name: 'Unstoppable', description: 'Maintain a 30-day streak', icon: '⚡', category: 'streaks', tier: 'gold', requirement: { type: 'streak', value: 30 }, xpReward: 75 },
      { name: 'Contestant', description: 'Participate in your first contest', icon: '🏁', category: 'contests', tier: 'bronze', requirement: { type: 'contests', value: 1 }, xpReward: 15 },
      { name: 'Veteran', description: 'Participate in 10 contests', icon: '🏆', category: 'contests', tier: 'gold', requirement: { type: 'contests', value: 10 }, xpReward: 50 },
      { name: 'XP Hunter', description: 'Earn 1000 XP', icon: '⭐', category: 'special', tier: 'silver', requirement: { type: 'xp', value: 1000 }, xpReward: 25 },
      { name: 'Persistent', description: 'Make 100 submissions', icon: '📝', category: 'special', tier: 'silver', requirement: { type: 'submissions', value: 100 }, xpReward: 20 },
    ]);

    console.log(`Created ${achievements.length} achievements`);

    // Contest
    const now = new Date();
    const contestStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const contestEnd = new Date(contestStart.getTime() + 2 * 60 * 60 * 1000);

    await Contest.create([
      {
        title: 'Weekly Challenge #1',
        slug: 'weekly-challenge-1',
        description: 'Test your skills with a mix of easy and medium problems. Top 3 earn bonus XP!',
        problems: problems.slice(0, 3).map((p) => p._id),
        startTime: contestStart,
        endTime: contestEnd,
        duration: 120,
        status: 'upcoming',
        difficulty: 'Mixed',
        xpReward: 50,
        createdBy: admin._id,
      },
      {
        title: 'Algorithm Sprint',
        slug: 'algorithm-sprint',
        description: 'A fast-paced contest focusing on fundamental algorithms and data structures.',
        problems: problems.slice(3, 6).map((p) => p._id),
        startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 46 * 60 * 60 * 1000),
        duration: 120,
        status: 'ended',
        difficulty: 'Medium',
        xpReward: 75,
        participants: [
          { user: users[0]._id, score: 200, problemsSolved: 2, penalty: 45, rank: 2, submissions: [] },
          { user: users[1]._id, score: 300, problemsSolved: 3, penalty: 30, rank: 1, submissions: [] },
          { user: users[3]._id, score: 100, problemsSolved: 1, penalty: 60, rank: 3, submissions: [] },
        ],
        createdBy: admin._id,
      },
    ]);

    console.log('Created 2 contests');

    // Daily Challenge
    await DailyChallenge.create({
      problem: problems[0]._id,
      date: new Date().setHours(0, 0, 0, 0),
      xpBonus: 20,
    });

    console.log('Created daily challenge');
    console.log('\nSeed completed successfully!');
    console.log('Admin login: admin@codequest.io / Admin@123');
    console.log('User login: john@example.com / User@123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
