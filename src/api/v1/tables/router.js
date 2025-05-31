const express = require("express");
const {
    getTablesController,
    getTablesByIDController,
    createTablesController,
    updateTablesController,
    deleteTablesController,
    regenerateTableQRCodeController,
} = require("./controller");
const { tableSchema } = require("../../../validators/tablesValidator");
const validateRequest = require("../../../middleware/validateRequest");

const router = express.Router();

router.get("/", (req, res) => {
    getTablesController(req, (result) => {
        res.json(result);
    });
});

router.get("/:id", (req, res) => {
    getTablesByIDController(req, (result) => {
        res.json(result);
    });
});

router.post("/", validateRequest(tableSchema), (req, res) => {
    createTablesController(req, (result) => {
        res.json(result);
    });
});

router.put("/:id", validateRequest(tableSchema), (req, res) => {
    updateTablesController(req, (result) => {
        res.json(result);
    });
});

router.delete("/:id", (req, res) => {
    deleteTablesController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/tables/{id}/regenerate-qr:
 *   post:
 *     summary: Regenerate QR code for a table
 *     description: Creates a new QR code for an existing table
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     responses:
 *       200:
 *         description: QR code regenerated successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     table_id:
 *                       type: integer
 *                     table_number:
 *                       type: integer
 *                     qr_code:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Table not found
 */
router.post("/:id/regenerate-qr", (req, res) => {
    regenerateTableQRCodeController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
