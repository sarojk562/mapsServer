var api = {};
api.includeRoutes = function(app){

    app.use('/status', (req, res, next) => {
        res.json({status : "OK! Connected to our server!!"});
    });

}

module.exports = api;