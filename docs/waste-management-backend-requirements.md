# Waste Management Backend API Requirements

## Current Status
✅ **Working**: Basic waste prediction endpoint  
⏳ **Pending**: Detailed waste breakdown fields and quick prediction endpoint

---

## 1. GET Endpoint (Already Implemented)
**Endpoint**: `GET /api/v1/salt-society/waste-management/predictions`

### Current Response Structure (Working)
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "date": "2026-02-02",
        "predicted_waste": 3022,
        "production_volume": 50000,
        "rain_sum": 204.46,
        "temperature_mean": 27.62,
        "humidity_mean": 81.19,
        "wind_speed_mean": 15.07,
        "type": "historical"
      }
    ],
    "averages": {
      "production_volume": 50000,
      "rain_sum": 192.2,
      "temperature_mean": 28.03,
      "humidity_mean": 83.53,
      "wind_speed_mean": 14.76,
      "predicted_waste": 2850
    }
  },
  "timestamp": "2026-03-04T17:12:36.684Z"
}
```

### Required Additional Fields
Add these fields to **EACH prediction object** and **averages object**:

#### Solid Waste Breakdown
```json
{
  "solid_waste_gypsum": 850,           // kg - Gypsum waste
  "solid_waste_limestone": 620,        // kg - Limestone residue
  "solid_waste_industrial_salt": 430,  // kg - Low-grade salt
  "total_solid_waste": 1900            // kg - Sum of above (auto-calculated)
}
```

#### Liquid Waste Breakdown
```json
{
  "liquid_waste_bittern": 750,         // L - Bittern (waste brine)
  "potential_epsom_salt": 120,         // kg - Recoverable MgSO4
  "potential_potash": 85,              // kg - Recoverable K2O
  "potential_magnesium_oil": 45,       // L - Recoverable Mg oil
  "total_liquid_waste": 1000           // L - Sum of liquid components
}
```

### Complete Example Response (Fully Functional Time Series)
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "date": "2026-02-02",
        "predicted_waste": 3022,
        "production_volume": 50000,
        "rain_sum": 204.46,
        "temperature_mean": 27.62,
        "humidity_mean": 81.19,
        "wind_speed_mean": 15.07,
        "type": "historical",
        "solid_waste_gypsum": 850,
        "solid_waste_limestone": 620,
        "solid_waste_industrial_salt": 430,
        "total_solid_waste": 1900,
        "liquid_waste_bittern": 750,
        "potential_epsom_salt": 120,
        "potential_potash": 85,
        "potential_magnesium_oil": 45,
        "total_liquid_waste": 1000
      },
      {
        "date": "2026-02-03",
        "predicted_waste": 2761,
        "production_volume": 50000,
        "rain_sum": 152.26,
        "temperature_mean": 26.61,
        "humidity_mean": 81.33,
        "wind_speed_mean": 14.03,
        "type": "historical",
        "solid_waste_gypsum": 780,
        "solid_waste_limestone": 570,
        "solid_waste_industrial_salt": 395,
        "total_solid_waste": 1745,
        "liquid_waste_bittern": 685,
        "potential_epsom_salt": 110,
        "potential_potash": 78,
        "potential_magnesium_oil": 42,
        "total_liquid_waste": 915
      },
      {
        "date": "2026-02-04",
        "predicted_waste": 2935,
        "production_volume": 50000,
        "rain_sum": 178.92,
        "temperature_mean": 27.15,
        "humidity_mean": 82.45,
        "wind_speed_mean": 14.55,
        "type": "historical",
        "solid_waste_gypsum": 820,
        "solid_waste_limestone": 600,
        "solid_waste_industrial_salt": 410,
        "total_solid_waste": 1830,
        "liquid_waste_bittern": 720,
        "potential_epsom_salt": 115,
        "potential_potash": 82,
        "potential_magnesium_oil": 43,
        "total_liquid_waste": 960
      },
      {
        "date": "2026-02-05",
        "predicted_waste": 3150,
        "production_volume": 50000,
        "rain_sum": 215.38,
        "temperature_mean": 28.22,
        "humidity_mean": 84.12,
        "wind_speed_mean": 15.28,
        "type": "historical",
        "solid_waste_gypsum": 885,
        "solid_waste_limestone": 645,
        "solid_waste_industrial_salt": 445,
        "total_solid_waste": 1975,
        "liquid_waste_bittern": 775,
        "potential_epsom_salt": 125,
        "potential_potash": 88,
        "potential_magnesium_oil": 47,
        "total_liquid_waste": 1035
      },
      {
        "date": "2026-03-05",
        "predicted_waste": 3200,
        "production_volume": 50000,
        "rain_sum": 195.50,
        "temperature_mean": 28.50,
        "humidity_mean": 83.80,
        "wind_speed_mean": 14.90,
        "type": "predicted",
        "solid_waste_gypsum": 900,
        "solid_waste_limestone": 655,
        "solid_waste_industrial_salt": 450,
        "total_solid_waste": 2005,
        "liquid_waste_bittern": 785,
        "potential_epsom_salt": 127,
        "potential_potash": 90,
        "potential_magnesium_oil": 48,
        "total_liquid_waste": 1050
      },
      {
        "date": "2026-03-06",
        "predicted_waste": 3050,
        "production_volume": 50000,
        "rain_sum": 185.20,
        "temperature_mean": 27.90,
        "humidity_mean": 83.20,
        "wind_speed_mean": 14.60,
        "type": "predicted",
        "solid_waste_gypsum": 860,
        "solid_waste_limestone": 625,
        "solid_waste_industrial_salt": 430,
        "total_solid_waste": 1915,
        "liquid_waste_bittern": 750,
        "potential_epsom_salt": 121,
        "potential_potash": 86,
        "potential_magnesium_oil": 46,
        "total_liquid_waste": 1003
      }
    ],
    "averages": {
      "production_volume": 50000,
      "rain_sum": 192.2,
      "temperature_mean": 28.03,
      "humidity_mean": 83.53,
      "wind_speed_mean": 14.76,
      "predicted_waste": 2850,
      "solid_waste_gypsum": 820,
      "solid_waste_limestone": 600,
      "solid_waste_industrial_salt": 410,
      "total_solid_waste": 1830,
      "liquid_waste_bittern": 730,
      "potential_epsom_salt": 115,
      "potential_potash": 80,
      "potential_magnesium_oil": 42,
      "total_liquid_waste": 967
    }
  },
  "timestamp": "2026-03-04T17:12:36.684Z"
}
```

**Note**: 
- This example shows 6 data points (4 historical + 2 predicted)
- In production, return 30 historical + 14 predicted = 44 total points
- `type` field distinguishes historical from predicted data
- All breakdown fields must be present for charts to render properly
- `total_solid_waste` + `total_liquid_waste` should approximately equal `predicted_waste`

---

## 2. POST Endpoint (Not Yet Implemented) - ASYNC PATTERN
**Endpoint**: `POST /api/v1/salt-society/waste-management/quick-prediction`

**Architecture**: Asynchronous with Event Hub  
- Request triggers ML job via Event Hub
- Immediate response with job ID
- User polls/refreshes to get results when ready

### Request Body
```json
{
  "production_volume": 50000,
  "rain_sum": 200,
  "temperature_mean": 28,
  "humidity_mean": 85,
  "wind_speed_mean": 15
}
```

### Immediate Response (Job Submission)
```json
{
  "success": true,
  "data": {
    "jobId": "pred-2026-03-04-17-30-12345",
    "status": "processing",
    "message": "Prediction job submitted successfully. Results will be available shortly.",
    "estimatedWaitTime": 30
  },
  "timestamp": "2026-03-04T17:30:00.000Z"
}
```

### GET Endpoint to Check Job Status
**Endpoint**: `GET /api/v1/salt-society/waste-management/quick-prediction/:jobId`

### Response When Processing
```json
{
  "success": true,
  "data": {
    "jobId": "pred-2026-03-04-17-30-12345",
    "status": "processing",
    "message": "Prediction is being calculated. Please check again in a few seconds.",
    "progress": 65
  },
  "timestamp": "2026-03-04T17:30:15.000Z"
}
```

### Response When Complete
```json
{
  "success": true,
  "data": {
    "jobId": "pred-2026-03-04-17-30-12345",
    "status": "completed",
    "prediction": {
      "date": "2026-03-04",
      "predicted_waste": 3000,
      "production_volume": 50000,
      "rain_sum": 200,
      "temperature_mean": 28,
      "humidity_mean": 85,
      "wind_speed_mean": 15,
      "type": "predicted",
      "solid_waste_gypsum": 840,
      "solid_waste_limestone": 610,
      "solid_waste_industrial_salt": 425,
      "total_solid_waste": 1875,
      "liquid_waste_bittern": 740,
      "potential_epsom_salt": 118,
      "potential_potash": 83,
      "potential_magnesium_oil": 44,
      "total_liquid_waste": 985
    }
  },
  "timestamp": "2026-03-04T17:30:35.000Z"
}
```

### Response When Failed
```json
{
  "success": false,
  "error": {
    "code": "PREDICTION_FAILED",
    "message": "ML model processing failed. Please try again.",
    "details": "Model inference timeout or invalid input parameters"
  },
  "timestamp": "2026-03-04T17:30:45.000Z"
}
```

---

## Implementation Priority

### Phase 1: Enhance Existing Endpoint ⚡ HIGH PRIORITY
Add waste breakdown fields to the existing `/predictions` endpoint.

**Why**: Enables pie charts, stacked area charts, and detailed composition analysis.

**Impact**: Dashboard will show:
- ✅ Solid waste breakdown pie chart (gypsum/limestone/industrial salt)
- ✅ Liquid waste + recoverable products pie chart
- ✅ Stacked area chart showing solid vs liquid waste over time
- ✅ Valorization potential calculation

### Phase 2: Quick Prediction Endpoint 🔄 MEDIUM PRIORITY
Implement the `/quick-prediction` async endpoints.

**Why**: Allows users to get instant predictions by manually entering parameters.

**Architecture**: 
- POST to submit job → Returns jobId
- GET with jobId to check status → Returns prediction when complete
- Frontend polls with "Check Status" button

**Impact**: Dashboard will show:
- ✅ Quick prediction mode toggle
- ✅ 5-field input form
- ✅ Job submission with status tracking
- ✅ Refresh button to check prediction status
- ✅ Visual indicators for processing/completed/failed states

**Optional Enhancement**: Implement WebSocket or Server-Sent Events for real-time status updates instead of manual refresh.

---

## Data Source Notes

Based on your federated learning architecture:

1. **Production & Environmental Data**: Already in your database ✅
   - `production_volume`, `rain_sum`, `temperature_mean`, `humidity_mean`, `wind_speed_mean`

2. **Waste Breakdown Data**: From ML predictions/reports 
   - Solid waste components (gypsum, limestone, industrial salt)
   - Liquid waste (bittern)
   - Recoverable products (epsom salt, potash, magnesium oil)

The breakdown fields should come from your federated learning model's predictions or historical waste reports, not from the production database directly.

---

## Testing the Integration

Once you add the breakdown fields, test with:

```bash
# Test existing endpoint
curl -X GET "http://localhost:3400/api/v1/salt-society/waste-management/predictions?startDate=2026-02-02&endDate=2026-03-18&includeAverages=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test quick prediction job submission (async pattern)
curl -X POST "http://localhost:3400/api/v1/salt-society/waste-management/quick-prediction" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "production_volume": 50000,
    "rain_sum": 200,
    "temperature_mean": 28,
    "humidity_mean": 85,
    "wind_speed_mean": 15
  }'

# Expected response: { "jobId": "pred-xxx", "status": "processing", ... }

# Test job status check
curl -X GET "http://localhost:3400/api/v1/salt-society/waste-management/quick-prediction/pred-xxx" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response when processing: { "jobId": "pred-xxx", "status": "processing", "progress": 65 }
# Expected response when complete: { "jobId": "pred-xxx", "status": "completed", "prediction": { ... } }
```

---

## Questions?

If you need help calculating the breakdown fields or integrating with your federated learning model:
1. Check your ML model's output schema
2. Map the predicted waste components to the field names above
3. Ensure totals match: `total_solid_waste` = sum of solid components
4. Ensure `predicted_waste` ≈ `total_solid_waste` + `total_liquid_waste` (with reasonable variance)
