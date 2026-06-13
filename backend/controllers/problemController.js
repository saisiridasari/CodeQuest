import Problem from '../models/Problem.js';

export const getProblems = async (req, res, next) => {
  try {
    const { difficulty, tags, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (difficulty) filter.difficulty = difficulty;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .select('-testCases -solution')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Problem.countDocuments(filter),
    ]);

    // Mark solved if user is authenticated
    let solvedSet = new Set();
    if (req.user) {
      solvedSet = new Set(req.user.solvedProblems.map((id) => id.toString()));
    }
    const data = problems.map((p) => ({
      ...p.toJSON(),
      isSolved: solvedSet.has(p._id.toString()),
    }));

    res.json({
      success: true,
      data,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getProblem = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
    const query = isObjectId
      ? { _id: idOrSlug, isActive: true }
      : { slug: idOrSlug, isActive: true };
    const problem = await Problem.findOne(query);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    // Build safe response — hide solutions and hidden test case outputs
    const data = problem.toJSON();
    data.testCases = problem.testCases.filter((tc) => !tc.isHidden);
    data.totalTestCases = problem.testCases.length;
    delete data.solution;
    if (req.user) {
      data.isSolved = req.user.solvedProblems.map((id) => id.toString()).includes(problem._id.toString());
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createProblem = async (req, res, next) => {
  try {
    const slug = req.body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const problem = await Problem.create({ ...req.body, slug, createdBy: req.user._id });
    res.status(201).json({ success: true, data: problem });
  } catch (error) {
    next(error);
  }
};

export const updateProblem = async (req, res, next) => {
  try {
    if (req.body.title) {
      req.body.slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, data: problem });
  } catch (error) {
    next(error);
  }
};

export const deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, message: 'Problem deleted' });
  } catch (error) {
    next(error);
  }
};

export const getRandomProblem = async (req, res, next) => {
  try {
    const { difficulty } = req.query;
    const filter = { isActive: true };
    if (difficulty) filter.difficulty = difficulty;
    const count = await Problem.countDocuments(filter);
    const random = Math.floor(Math.random() * count);
    const problem = await Problem.findOne(filter).skip(random).select('-testCases -solution');
    res.json({ success: true, data: problem });
  } catch (error) {
    next(error);
  }
};
