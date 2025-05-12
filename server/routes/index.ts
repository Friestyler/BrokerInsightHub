import { Router } from 'express';
import * as entityDefinitionRoutes from './entityDefinitions';
import * as entityAttributeRoutes from './entityAttributes';
import * as relationshipAttributeRoutes from './relationshipAttributes';

const router = Router();

// Entity definitions routes
router.get('/entity-definitions', entityDefinitionRoutes.getEntityDefinitions);
router.get('/entity-definitions/:id', entityDefinitionRoutes.getEntityDefinition);
router.post('/entity-definitions', entityDefinitionRoutes.createEntityDefinition);
router.patch('/entity-definitions/:id', entityDefinitionRoutes.updateEntityDefinition);
router.delete('/entity-definitions/:id', entityDefinitionRoutes.deleteEntityDefinition);

// Entity attributes routes
router.get('/entity-attributes/:entityDefinitionId', entityAttributeRoutes.getEntityAttributes);
router.get('/entity-attribute/:id', entityAttributeRoutes.getEntityAttribute);
router.post('/entity-attributes', entityAttributeRoutes.createEntityAttribute);
router.patch('/entity-attributes/:id', entityAttributeRoutes.updateEntityAttribute);
router.delete('/entity-attributes/:id', entityAttributeRoutes.deleteEntityAttribute);

// Relationship attributes routes
router.get('/relationship-attributes', relationshipAttributeRoutes.getRelationshipAttributes);
router.get('/relationship-attributes/:id', relationshipAttributeRoutes.getRelationshipAttribute);
router.post('/relationship-attributes', relationshipAttributeRoutes.createRelationshipAttribute);
router.patch('/relationship-attributes/:id', relationshipAttributeRoutes.updateRelationshipAttribute);
router.delete('/relationship-attributes/:id', relationshipAttributeRoutes.deleteRelationshipAttribute);

export default router;