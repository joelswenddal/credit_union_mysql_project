module.exports = function () {
    var express = require('express');
    var router = express.Router();

    function getTransactions(res, mysql, context, complete) {
        mysql.pool.query("SELECT transaction_ID,account_ID,date_time,amount,transaction_type FROM transactions", function (error, results, fields) {

            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            //populates the context
            context.transactions = results;
            complete();
        });
    }


    /*dropdown*/
    function getID(res, mysql, context, complete) {
        mysql.pool.query("SELECT account_ID FROM accounts", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            //populates the context
            context.accounts = results;
            complete();
        });
    }


    /*Display all offers*/
    router.get('/', function (req, res) {
        let callbackCount = 0;
        let context = {};
        context.jsscripts = ["deletetransaction.js"];
        let mysql = req.app.get('mysql');
        getTransactions(res, mysql, context, complete);
        getID(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('transactions', context);
            }
        }
    });

    /*Adds an offer, redirects to offers page after adding*/
    router.post('/', function (req, res) {
        console.log(req.body)

        let mysql = req.app.get('mysql');
        let sql = "INSERT INTO transactions (account_ID, amount, transaction_type) VALUES (? , ?, ?)";
        let inserts = [req.body.accountID, req.body.amount, req.body.transactionType];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/transactions');
            }
        });
    });

    /* For dev - Route to delete a transaction, simply returns a 202 upon success. Ajax will handle this. */
    /*
    router.delete('/:transaction_id', function (req, res) {
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM transactions WHERE transaction_ID = ?";
        var inserts = [req.params.transaction_id];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            } else {
                res.status(202).end();
            }
        })
    });
    */


    return router;
}();