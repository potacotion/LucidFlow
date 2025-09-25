/**
 * @swagger
 * components:
 *   schemas:
 *     NodeDefinition:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *         label:
 *           type: string
 *         description:
 *           type: string
 *         archetype:
 *           type: string
 *           enum: [action, pure, branch, merge, fork, join, loop, compound]
 *         ports:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PortDefinition'
 *         properties:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PropertyDefinition'
 *     PortDefinition:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         label:
 *           type: string
 *         type:
 *           type: string
 *           enum: [control, data]
 *         direction:
 *           type: string
 *           enum: [in, out]
 *         dataMode:
 *           type: string
 *           enum: [batch, stream]
 *         dataType:
 *           type: string
 *         defaultValue:
 *           type: object
 *     PropertyDefinition:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         label:
 *           type: string
 *         type:
 *           type: string
 *           enum: [string, number, boolean, select, slider, textarea, code]
 *         defaultValue:
 *           type: object
 *         description:
 *           type: string
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               value:
 *                 type: object
 *         min:
 *           type: number
 *         max:
 *           type: number
 *         step:
 *           type: number
 *         language:
 *           type: string
 *     Workflow:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         graph:
 *           $ref: '#/components/schemas/Graph'
 *     Graph:
 *       type: object
 *       properties:
 *         nodes:
 *           type: array
 *           items:
 *             type: object
 *         edges:
 *           type: array
 *           items:
 *             type: object
 */