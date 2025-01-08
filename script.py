import json

# Read JSON data from file
with open('stromy.json', 'r', encoding='utf-8') as file:
    json_data = json.load(file)

# Extract the geometry, type, and OBJECTID for each feature
features = [
    {
        "type": feature["type"],
        "geometry": feature["geometry"],
        "properties": {
            "OBJECTID": feature["properties"]["OBJECTID"]
        }
    }
    for feature in json_data["features"]
]

# Create a new GeoJSON FeatureCollection with the geometry, type, and OBJECTID
output_data = {
    "type": "FeatureCollection",
    "features": features
}

# Write the new GeoJSON data into a file
output_filename = 'stromy-geo.json'
with open(output_filename, 'w', encoding='utf-8') as outfile:
    json.dump(output_data, outfile, ensure_ascii=False, indent=4)

print(f"Filtered GeoJSON written to {output_filename}")
