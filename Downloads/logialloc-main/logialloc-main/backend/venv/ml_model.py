from sklearn.ensemble import RandomForestRegressor
import numpy as np

model = RandomForestRegressor()

# Dummy training data
X = np.array([
    [100, 200],
    [150, 300],
    [200, 400],
    [250, 500]
])

y = np.array([5000, 7000, 9000, 12000])

model.fit(X, y)

def predict_cost(df):

    # Example features:
    # distance + weight

    sample = np.array([[180, 350]])

    prediction = model.predict(sample)

    return float(prediction[0])