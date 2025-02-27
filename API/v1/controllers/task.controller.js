const Task = require('../models/task.model');
const paginationHelper = require("../../../helpers/pagination");
const searchHelpers = require("../../../helpers/search");
// [GET] api/v1/tasks
module.exports.index = async (req, res) => {
    const objectFind = {
        $or: [
            { createdBy: req.user.id },
            { participants: req.user.id }
        ],
        deleted: false,
    };
    if (req.query.status) {
        objectFind.status = req.query.status;
    }
    const objectSort = {};
    if (req.query.sortKey && req.query.sortValue) {
        objectSort[req.query.sortKey] = req.query.sortValue;
    }
    //find
    const objectSearch = searchHelpers(req.query);

    if (objectSearch.regex) {
        objectFind.title = objectSearch.regex;
    }
    //pagination
    const initPagination = {
        currentPage: 1,
        limitItem: 4,
    };
    const countTask = await Task.countDocuments(objectFind);
    const objectPagination = paginationHelper(initPagination, req.query, countTask);

    const tasks = await Task.find(objectFind)
                            .sort(objectSort)
                            .limit(objectPagination.limitItem)
                            .skip(objectPagination.skip);
    
    res.json(tasks);
}
// [GET] api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        const task = await Task.findOne({
            _id: id,
            deleted: false,
        });
        res.json(task);
    } catch(error) {
        res.json("Not found !");
    }
}

// [PATCH] api/v1/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.body.status;
        await Task.updateOne({ _id: id }, { status: status });
        res.json({ 
            code: 200,
            message: "Update status successfully !"
        });
    } catch(error) {
        res.json({
            code: 400, 
            message: "Not exist !"
        });
    }
}

// [PATCH] api/v1/tasks/change-multi/
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, key, value } = req.body;
        if (key == 'status') {
            await Task.updateMany(
                { _id: { $in: ids }},
                { status: value } 
            );
        } else if (key == 'delete') {
            await Task.updateMany(
                { _id: { $in: ids }},
                { 
                    deleted: true,
                    deletedAt: new Date()
                }
            );
        }
        res.json({ 
            code: 200,
            message: "Update successfully !"
        });
    } catch(error) {
        res.json({
            code: 400, 
            message: "Not exist !"
        });
    }
}

// [POST] api/v1/tasks/create
module.exports.create = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        
        const task = new Task(req.body);
        const data = await task.save();
        res.json({ 
            code: 200,
            message: "Create successfully !",
            data: data
        });
    } catch(error) {
        res.json({
            code: 400, 
            message: "Create failed !"
        });
    }
}

// [PATCH] api/v1/tasks/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        await Task.updateOne(
            { _id: id },
            req.body
        );
        res.json({ 
            code: 200,
            message: "Edit successfully !",
        });
    } catch(error) {
        res.json({
            code: 400, 
            message: "Edit failed !"
        });
    }
}

// [DELETE] api/v1/tasks/delete/:id
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await Task.updateOne(
            { _id: id },
            { 
                deleted: true,
                deletedAt: new Date()
            }
        );
        res.json({ 
            code: 200,
            message: "Delete successfully !",
        });
    } catch(error) {
        res.json({
            code: 400, 
            message: "Delete failed !"
        });
    }
}