# cfchackathon2026

## Plant identification

Install the dependencies from `requirements.txt`, then set the PlantNet API key before starting Flask:

```powershell
$env:PLANTNET_API_KEY = "your-plantnet-api-key"
python app.py
```

After a camera photo is captured, GardenQuest uploads it to Flask. Flask sends it to PlantNet and the top common and scientific names are displayed in the camera dialog.