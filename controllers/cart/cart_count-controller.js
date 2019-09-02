const formidable = require('formidable');
const Cart_item = require('../../models/cart-item');
const jwt = require('../jwt');
const redis = require('../redis');
const Cart = require('../../models/cart');

exports.count = (req, res) => {
  redis.authenticateToken(req.headers.authorization, (result) => {
    if (result == false) {
      const jwt_result = jwt.jwt_verify(req.headers.authorization);

      if (jwt_result && jwt_result != undefined) {
        new formidable.IncomingForm().parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error', err)
            throw err
          }

          const user_id = jwt_result;
          let cart_id = null;
          await Cart.findOne({
              where: [{
                  userId: user_id
                },
                {
                  status: '1'
                }
              ]
            })
            .then(active_cart => {
              if (!active_cart) {
                return res.status(400).json({
                  status: "false",
                  message: "No cart found",
                  count: 0
                });
              } else {
                cart_id = active_cart.id;
              }
            })
            .catch(err => {
              return res.status(400).json({
                status: "false",
                error: err,
                message: "Failure"
              });
            });

          Cart_item.findAndCountAll({
              where: {
                cartId: cart_id
              }
            })
            .then(item_count => {
              if (item_count.count == 0) {
                return res.status(200).json({
                  status: "true",
                  message: "cart empty",
                  count: 0
                });
              } else {
                return res.status(200).json({
                  status: "true",
                  message: "cart items count",
                  count: item_count.count
                });
              }
            })
        });
      } else {
        return res.status(400).json({
          status: "false",
          message: "Token not verified"
        });
      }
    } else {
      return res.status(400).json({
        status: "false",
        message: "User not Logged In"
      });
    }
  });
}