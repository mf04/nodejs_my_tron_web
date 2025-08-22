function pagination(defaultLimit = 10, maxLimit = 100) {
    return (req, res, next) => {
        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.pageSize, 10) || defaultLimit;

        if (page < 1) page = 1;
        if (limit < 1) limit = defaultLimit;

        if (limit > maxLimit) limit = maxLimit;

        const skip = (page - 1) * limit;

        req.pagination = { page, limit, skip };

        next();
    };
}

export default pagination;

