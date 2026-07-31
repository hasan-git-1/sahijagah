import { defineMcp, auth } from "@lovable.dev/mcp-js";
import searchProperties from "./tools/search-properties";
import getProperty from "./tools/get-property";
import listCities from "./tools/list-cities";

const supabaseUrl = process.env.SUPABASE_URL ?? "";

export default defineMcp({
  name: "urbanstay-mcp",
  title: "urbanStay",
  version: "0.1.0",
  instructions:
    "MCP server for urbanStay, an Indian property rental and sales platform. Sign-in is required. Use `list_cities` to discover cities with active listings, `search_properties` to find approved listings by city, price, BHK, or listing type, and `get_property` to fetch a single listing's full details by ID. Only approved public listings are exposed; per-user data (bookings, messages, wishlists) is not available.",
  auth: auth.oauth.issuer({
    issuer: `${supabaseUrl}/auth/v1`,
    jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
    resource: `${supabaseUrl}/functions/v1/mcp`,
    acceptedAudiences: ["authenticated"],
    resourceName: "urbanStay",
  }),
  tools: [searchProperties, getProperty, listCities],
});
