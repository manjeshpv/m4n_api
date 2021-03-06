const formidable = require("formidable");
const Partner = require("../../models/partner");
const Sale = require("../../models/sale");
const jwt = require("../jwt");
const redis = require("../redis");

module.exports.commissionAccrued = (req, res) => {
  redis.authenticateToken(req.headers.authorization, result => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, (err, fields) => {
          const partnerId = jwt_result;
          let totalCommission = 0;

          Partner.findOne({
            where: {
              id: partnerId
            }
          })
            .then(partner => {
              if (partner) {
                Sale.findAll({
                  where: {
                    partnerId
                  }
                })
                  .then(results => {
                    for (let i in results) {
                      totalCommission += results[i].commission_amount;
                    }
                    res.status(200).json({
                      totalCommission: parseFloat(totalCommission.toFixed(2)),
                      status: 200
                    });
                  })
                  .catch(() => {
                    res.status(203).json({
                      message: "No commissions so far",
                      status: 203
                    });
                  });
              } else {
                res.status(203).json({
                  message: "Partner not found",
                  status: 203
                });
              }
            })
            .catch(() => {
              res.status(400).json({
                message: "Please provide partner id",
                status: 400
              });
            });
        });
      } else {
        res.status(400).json({
          status: 400,
          message: "Token not verified"
        });
      }
    } else {
      res.status(400).json({
        status: 400,
        message: "Partner not Logged In"
      });
    }
  });
};
