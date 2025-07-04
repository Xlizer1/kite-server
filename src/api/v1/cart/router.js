const express = require("express");
const {
    getCartController,
    initializeCartController,
    addCartItemController,
    updateCartItemController,
    removeCartItemController,
    clearCartController,
    callCaptainController,
    getCaptainCallsController,
    updateCaptainCallController,
    createOrderFromCartController,
    validateCartSessionController,
    getCartSessionInfoController,
} = require("./controller");
const {
    cartSchema,
    cartItemSchema,
    captainCallSchema,
    createOrderSchema,
} = require("../../../validators/cartValidator");
const validateRequest = require("../../../middleware/validateRequest");

const router = express.Router();

router.get("/", (req, res) => {
    getCartController(req, (result) => {
        res.json(result);
    });
});

// router.post("/initialize", validateRequest(cartSchema), (req, res) => {
//     initializeCartController(req, (result) => {
//         res.json(result);
//     });
// });

router.post("/items", validateRequest(cartItemSchema), (req, res) => {
    addCartItemController(req, (result) => {
        res.json(result);
    });
});

router.put("/items/:cartItemId", validateRequest(cartItemSchema), (req, res) => {
    updateCartItemController(req, (result) => {
        res.json(result);
    });
});

router.delete("/items/:cartItemId", (req, res) => {
    removeCartItemController(req, (result) => {
        res.json(result);
    });
});

router.delete("/clear", (req, res) => {
    clearCartController(req, (result) => {
        res.json(result);
    });
});

router.post("/call-captain", (req, res) => {
    callCaptainController(req, (result) => {
        res.json(result);
    });
});

router.get("/captain-calls", (req, res) => {
    getCaptainCallsController(req, (result) => {
        res.json(result);
    });
});

router.put("/captain-calls/:callId", validateRequest(captainCallSchema), (req, res) => {
    updateCaptainCallController(req, (result) => {
        res.json(result);
    });
});

router.post("/create-order", validateRequest(createOrderSchema), (req, res) => {
    createOrderFromCartController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/cart/validate-session:
 *   get:
 *     summary: Validate cart session
 *     description: Check if current session is valid and get session info
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Session validation result
 */
router.get("/validate-session", (req, res) => {
    validateCartSessionController(req, (result) => {
        res.json(result);
    });
});

router.get("/session-info", (req, res) => {
    getCartSessionInfoController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
