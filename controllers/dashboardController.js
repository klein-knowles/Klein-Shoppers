const Dashboard = require("../models/dashboardModel");

// ======================================
// Dashboard Statistics
// ======================================

exports.getStats = (req, res) => {

    Dashboard.getStats((err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json(err);

        }

        res.json(rows[0]);

    });

};

// ======================================
// Monthly Revenue
// ======================================

exports.getMonthlyRevenue = (req, res) => {

    Dashboard.monthlyRevenue((err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json(err);

        }

        res.json(rows);

    });

};

// ======================================
// Recent Orders
// ======================================

exports.getRecentOrders = (req, res) => {

    Dashboard.recentOrders((err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json(err);

        }

        res.json(rows);

    });

};

// ======================================
// Low Stock Products
// ======================================

exports.getLowStock = (req, res) => {

    Dashboard.lowStock((err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json(err);

        }

        res.json(rows);

    });

};

// ======================================
// Best Selling Products
// ======================================

exports.getBestSelling = (req, res) => {

    Dashboard.bestSelling((err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json(err);

        }

        res.json(rows);

    });

};

// ======================================
// Complete Dashboard
// ======================================

exports.getDashboard = (req, res) => {

    Dashboard.getStats((err, stats) => {

        if (err) {

            return res.status(500).json(err);

        }

        Dashboard.monthlyRevenue((err2, monthly) => {

            if (err2) {

                return res.status(500).json(err2);

            }

            Dashboard.recentOrders((err3, recent) => {

                if (err3) {

                    return res.status(500).json(err3);

                }

                Dashboard.lowStock((err4, stock) => {

                    if (err4) {

                        return res.status(500).json(err4);

                    }

                    Dashboard.bestSelling((err5, best) => {

                        if (err5) {

                            return res.status(500).json(err5);

                        }

                        res.json({

                            stats: stats[0],

                            monthlyRevenue: monthly,

                            recentOrders: recent,

                            lowStock: stock,

                            bestSelling: best

                        });

                    });

                });

            });

        });

    });

};