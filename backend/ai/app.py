"""Internal AI forecast microservice (Prophet-style baseline)."""

from __future__ import annotations

from flask import Flask, jsonify, request

from services.admin_forecast_service import _baseline_forecast

ai_app = Flask(__name__)


@ai_app.get("/predict")
def predict():
    hospital_id = request.args.get("hospital_id", type=int)
    if not hospital_id:
        return jsonify({"error": "hospital_id required"}), 400

    series = _baseline_forecast(hospital_id)
    return jsonify({"series": series, "model": "baseline-prophet-gateway"})


if __name__ == "__main__":
    ai_app.run(host="127.0.0.1", port=5001, debug=True)
