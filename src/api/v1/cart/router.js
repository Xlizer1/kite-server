const express = require("express");
const {
    getCartController,
    placeOrderFromCartController,
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

/**
 * @swagger
 * /api/v1/cart/place-order:
 *   post:
 *     summary: Place order from cart (Customer)
 *     description: Converts customer's cart items into an order. No authentication required - uses session validation.
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Cart session ID (can also be from cookies)
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               special_request:
 *                 type: string
 *                 description: Special request for the order
 *                 example: "Extra spicy, no onions"
 *               allergy_info:
 *                 type: string
 *                 description: Allergy information
 *                 example: "Allergic to nuts and dairy"
 *               customer_name:
 *                 type: string
 *                 description: Customer name (optional)
 *                 example: "John Doe"
 *     responses:
 *       200:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order placed successfully! Please wait for captain approval."
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *                       example: 123
 *                     tableNumber:
 *                       type: integer
 *                       example: 5
 *                     itemsCount:
 *                       type: integer
 *                       example: 3
 *                     totalAmount:
 *                       type: number
 *                       example: 45.50
 *                     estimatedTime:
 *                       type: string
 *                       example: "15-20 minutes"
 *       400:
 *         description: Invalid request (empty cart, missing session, etc.)
 *       404:
 *         description: Cart/session not found
 */
router.post("/place-order", (req, res) => {
    placeOrderFromCartController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
