import requests
import os
from pathlib import Path

# ===== CONFIGURATION =====
API_URL = "https://my-api.plantnet.org/v2/identify/all"


def get_api_key() -> str:
    api_key = os.environ.get("PLANTNET_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("PLANTNET_API_KEY is not configured.")
    return api_key


def identify_plant_from_file(image_path: str, nb_results: int = 5) -> dict:
    """
    Identify a plant from a local image file.

    Args:
        image_path: Path to the image file (JPG or PNG)
        nb_results: Number of top species to return (1-25)[reference:5]

    Returns:
        API response as a dictionary
    """
    # Open and encode the image
    with open(image_path, "rb") as f:
        image_data = f.read()

    # Prepare multipart form data
    files = {"images": (Path(image_path).name, image_data, "image/jpeg")}
    data = {
        # PlantNet requires the plant organ represented by the image.
        "organs": "other",
    }
    params = {
        "api-key": get_api_key(),
        "nb-results": max(1, min(nb_results, 25)),
        "lang": "en",
    }

    # Make the request[reference:7][reference:8]
    response = requests.post(API_URL, params=params, data=data, files=files, timeout=30)
    response.raise_for_status()
    return response.json()


def identify_plant_from_url(image_url: str, nb_results: int = 5) -> dict:
    """
    Identify a plant from a remote image URL.

    Args:
        image_url: Public URL of the image
        nb_results: Number of top species to return (1-25)

    Returns:
        API response as a dictionary
    """
    params = {
        "api-key": get_api_key(),
        "images": image_url,
        "nb-results": max(1, min(nb_results, 25)),
        "lang": "en",
        "organs": "other",
    }

    response = requests.get(
        API_URL, params=params, timeout=30
    )  # GET for remote images[reference:9]
    response.raise_for_status()
    return response.json()


def parse_results(response: dict) -> list:
    """
    Extract and format the top species predictions.
    """
    results = []
    for result in response.get("results", [])[:5]:
        species = result.get("species", {})
        results.append(
            {
                "scientific_name": species.get(
                    "scientificNameWithoutAuthor", "Unknown"
                ),
                "common_name": (
                    species.get("commonNames", [""])[0]
                    if species.get("commonNames")
                    else ""
                ),
                "family": species.get("family", {}).get(
                    "scientificNameWithoutAuthor", ""
                ),
                "genus": species.get("genus", {}).get(
                    "scientificNameWithoutAuthor", ""
                ),
                "score": result.get("score", 0),  # Confidence score (0-1)[reference:10]
            }
        )
    return results


# ===== USAGE =====
if __name__ == "__main__":
    # Option 1: From a local file
    response = identify_plant_from_file("path/to/your/plant_photo.jpg")

    # Option 2: From a URL
    # response = identify_plant_from_url("https://example.com/plant.jpg")

    # Print results
    predictions = parse_results(response)
    for i, pred in enumerate(predictions, 1):
        print(f"{i}. {pred['scientific_name']} (score: {pred['score']:.2f})")
        if pred["common_name"]:
            print(f"   Common name: {pred['common_name']}")
        print(f"   Family: {pred['family']} | Genus: {pred['genus']}\n")
