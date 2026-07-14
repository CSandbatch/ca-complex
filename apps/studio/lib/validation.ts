import Ajv2020, { type ErrorObject } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import definitions from "../../../packages/contracts/schemas/definitions.schema.json";
import cardSchema from "../../../packages/contracts/schemas/card-document.schema.json";
import assetSchema from "../../../packages/contracts/schemas/asset.schema.json";
import type { AssetMetadata, StudioProject } from "./types";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(definitions);
const validate = ajv.compile(cardSchema);
const validateAsset = ajv.compile(assetSchema);

export interface ValidationResult {
  valid: boolean;
  errors: ErrorObject[];
}

export function validateStudioProject(project: StudioProject): ValidationResult {
  const valid = validate(project.card);
  return { valid: Boolean(valid), errors: [...(validate.errors ?? [])] };
}

export function validateAssetMetadata(metadata: AssetMetadata): ValidationResult {
  const valid = validateAsset(metadata);
  return { valid: Boolean(valid), errors: [...(validateAsset.errors ?? [])] };
}
