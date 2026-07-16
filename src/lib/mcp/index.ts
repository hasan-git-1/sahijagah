import { defineMcp } from "@lovable.dev/mcp-js";
import searchProperties from "./tools/search-properties";
import getProperty from "./tools/get-property";
import listCities from "./tools/list-cities";

export default defineMcp({
  name: "urbanstay-mcp",
  title: "urbanStay",
  version: "0.1.0",
  instructions:
    "Public MCP server for urbanStay, an Indian property rental and sales platform. Use `list_cities` to discover cities with active listings, `search_properties` to find approved listings by city, price, BHK, or listing type, and `get_property` to fetch a single listing's full details by ID. Only approved public listings are exposed; per-user data (bookings, messages, wishlists) is not available.",
  tools: [searchProperties, getProperty, listCities],
});
