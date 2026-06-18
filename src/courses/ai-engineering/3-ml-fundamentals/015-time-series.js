const lesson = {
  id: 'ae2-15',
  slug: 'time-series',
  chapter: 'ae-p2',
  order: 14,
  title: 'Time Series Fundamentals',
  subtitle: 'Past performance does predict future results — if you check for stationarity first',
  tags: ['time-series', 'forecasting', 'lag-features', 'walk-forward', 'stationarity', 'arima'],
  hook: {
    question: 'A model trained on daily sales data gets 95% accuracy with random cross-validation. What will it get with proper time-based evaluation?',
    realWorldContext: 'A model that gets 95% accuracy with random CV might get 55% with walk-forward validation because random splits let future data train the model to predict the past — information that would never be available in production.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      `Standard ML assumes i.i.d. — independent and identically distributed. Each sample is drawn from the same distribution, independently of others. Time series violates both: today's sales depend on yesterday's (not independent), and the December distribution looks different from March (not identically distributed).`,
      `Every time series decomposes into three components: Trend (long-term direction — revenue growing 10% per year), Seasonality (repeating patterns — retail sales spike in December), and Residual (random variation after removing trend and seasonality). If the residual looks like white noise, the decomposition captured the signal.`,
      `A time series is stationary if its statistical properties — mean, variance, autocorrelation — don't change over time. Most forecasting methods assume stationarity. A non-stationary series has a drifting mean, so a model trained in January learns a different mean than what February will show. Fix with differencing: diff[t] = value[t] − value[t−1]. First differencing removes linear trends. Second differencing removes quadratic trends. Rarely need more than two.`,
      `Autocorrelation (ACF) measures how much a value at time t correlates with the value at time t−k. ACF tells you how far back the series "remembers", whether seasonality exists (ACF spikes at lag 7 for weekly data), and how many lag features to create.`,
      `Lag features convert a time series into a supervised learning problem. Take series [10, 12, 14, 13, 15]. Lag-1 feature = previous value, lag-2 = two steps back. Each row: [lag₂, lag₁, target]. Now any ML model (ridge regression, random forest, gradient boosting) can learn from this feature matrix. The target alignment trap: all features must use values from time t−1 or earlier. Including the value at time t is a perfect predictor and a useless model.`,
      `Walk-forward validation is the most important concept for time series. Standard K-fold randomly assigns samples to train and test — future data can train the model to predict the past. Walk-forward always trains on past data and tests on future data: train on data up to t, predict at t+1, slide the window forward, repeat. Each test fold contains only data that comes AFTER all training data.`,
      `ARIMA(p, d, q) combines three components: AR(p) uses the last p values as predictors, I(d) applies d rounds of differencing for stationarity, MA(q) uses the last q forecast errors. You choose p, d, q from ACF/PACF plots or automated search. For most practical problems, lag features + gradient boosting is stronger: handles external features, doesn't require stationarity, and is easy to debug.`,
      `Always beat naive baselines before claiming your model works. Last-value persistence: predict tomorrow = today. Seasonal naive: predict today = same day last week. Moving average: predict = mean of last k values. If your model loses to seasonal naive, you have a bug — likely future leakage in features or wrong evaluation method.`,
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Random Split = Data Leakage for Time Series',
        body: `In a random 80/20 split on 100 time steps, future data points (e.g., step 80) can end up in training while past points (e.g., step 20) end up in test. The model then uses future information to predict the past — optimistic accuracy that won't hold in production.`,
      },
      {
        type: 'info',
        title: 'Prediction Moment',
        body: `Before reading on: a series is [100, 102, 106, 112, 120]. First difference: [2, 4, 6, 8]. Is this stationary? What would second differencing give? Predict: how many rounds of differencing does a pure linear trend need vs. a quadratic trend?`,
      },
      {
        type: 'info',
        title: 'Lag Feature Alignment Rule',
        body: `When predicting y[t], features must only use values at t−1 or earlier. y[t−1] is lag-1 (OK). y[t] is target (not a feature). rolling_mean over last 7 days as of t−1 (OK). rolling_mean including t (leakage). The most common time series bug: accidentally including the current value as a feature.`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Time Series Toolkit',
        mathBridge: `ACF(k) = Cov(y[t], y[t-k]) / Var(y). Differencing: d[t] = y[t] − y[t-1]. Lag matrix: row i = [y[i-k], ..., y[i-1]], target = y[i]. Walk-forward: train on [0..t], test on [t..t+step], increment t.`,
        caption: 'Build stationarity checks, lag features, walk-forward validation, and an AR model from scratch.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stationarity, Differencing, and Autocorrelation',
              prose: [
                `We generate three series with different stationarity properties and check each using rolling statistics. Series 1: pure white noise (stationary). Series 2: linear trend (non-stationary). Series 3: sine wave with trend (non-stationary, with seasonality).`,
                `Stationarity check: split the series in half. If the means differ by more than half a standard deviation, or variance ratio exceeds 2×, the series is flagged as non-stationary.`,
                `Autocorrelation ACF(k) = Cov(y[t], y[t−k]) / Var(y). For pure white noise, ACF(k≥1) ≈ 0. For a series with memory, ACF decays slowly. For a seasonal series, ACF spikes at multiples of the period.`,
              ],
              code: `import numpy as np

rng = np.random.default_rng(42)
N = 200

# Three series
noise   = rng.normal(0, 1, N)
trend   = np.arange(N) * 0.1 + rng.normal(0, 0.5, N)
season  = np.sin(np.arange(N) * 2*np.pi/20) + np.arange(N)*0.05 + rng.normal(0,0.3,N)

def stationarity_check(s):
    h1, h2 = s[:len(s)//2], s[len(s)//2:]
    mean_diff = abs(h1.mean() - h2.mean())
    var_ratio = h1.var() / (h2.var() + 1e-9)
    is_stat = (mean_diff < 0.5 * s.std()) and (0.5 < var_ratio < 2.0)
    return is_stat, mean_diff, var_ratio

def autocorr(s, max_lag=20):
    n, m, v = len(s), s.mean(), s.var()
    return [np.mean((s[:n-k]-m)*(s[k:]-m))/v if v>0 else 0 for k in range(max_lag+1)]

print("Stationarity checks:")
for name, s in [("White noise", noise), ("Linear trend", trend), ("Seasonal+trend", season)]:
    stat, md, vr = stationarity_check(s)
    print(f"  {name:<20}: stationary={stat}, mean_diff={md:.3f}, var_ratio={vr:.3f}")

print("\\nACF at lags 1-5 and 20:")
for name, s in [("White noise", noise), ("Seasonal+trend (period=20)", season)]:
    acf = autocorr(s, 20)
    print(f"  {name}:")
    print(f"    lags 1-5: {[round(a,3) for a in acf[1:6]]}")
    print(f"    lag 20:   {round(acf[20],3)}")

# Apply differencing to trend series
diff1 = np.diff(trend)
diff2 = np.diff(diff1)
s1, _, _ = stationarity_check(diff1)
s2, _, _ = stationarity_check(diff2)
print(f"\\nTrend after 1st diff: stationary={s1}")
print(f"Trend after 2nd diff: stationary={s2}")`,
            },
            {
              id: 2,
              cellTitle: 'Lag Features and Walk-Forward Validation',
              prose: [
                `We convert a time series into a supervised learning matrix using lag features, then evaluate with walk-forward validation. This is the standard way to use any ML model (ridge regression, tree, gradient boosting) for time series forecasting.`,
                `The lag matrix: row i has features [y[i−k], ..., y[i−1]] and target y[i]. The first k rows are dropped (not enough history). The alignment rule ensures no future information: all features come from t−1 or earlier.`,
                `Walk-forward: we use 5 expanding-window folds. In each fold, training ends at some time t and testing covers [t, t+step]. We compare walk-forward MAE vs. a random split to show the gap caused by temporal leakage.`,
              ],
              code: `import numpy as np

rng = np.random.default_rng(5)
N = 300
t = np.arange(N)
# True signal: AR(2) process with seasonality
true_ar = np.zeros(N)
for i in range(2, N):
    true_ar[i] = 0.6*true_ar[i-1] - 0.2*true_ar[i-2] + rng.normal(0, 0.5)
series = true_ar + 0.3*np.sin(2*np.pi*t/20)

def make_lags(s, k):
    n = len(s)
    X = np.column_stack([s[k-j-1:n-j-1] for j in range(k)])
    y = s[k:]
    return X, y

def ridge_fit(X, y, alpha=0.1):
    w = np.linalg.solve(X.T @ X + alpha*np.eye(X.shape[1]), X.T @ y)
    return w

K = 5  # lags
X, y = make_lags(series, K)
n = len(y)

# Walk-forward validation (5 expanding folds)
n_splits = 5
min_train = int(n * 0.4)
step = (n - min_train) // n_splits
wf_maes = []
for i in range(n_splits):
    train_end = min_train + i * step
    test_end  = min(train_end + step, n)
    if train_end >= n: break
    w = ridge_fit(X[:train_end], y[:train_end])
    preds = X[train_end:test_end] @ w
    wf_maes.append(np.abs(preds - y[train_end:test_end]).mean())

# Random split (leaky for time series)
idx = rng.permutation(n)
tr, te = idx[:int(0.8*n)], idx[int(0.8*n):]
w_rand = ridge_fit(X[tr], y[tr])
rand_mae = np.abs(X[te] @ w_rand - y[te]).mean()

print(f"Walk-forward MAE: {np.mean(wf_maes):.4f} ± {np.std(wf_maes):.4f}")
print(f"Random split MAE: {rand_mae:.4f}")
print(f"Gap (random - walk-forward): {rand_mae - np.mean(wf_maes):.4f}")
print("(Negative gap means random split gave optimistically low MAE)")

# Naive baseline: last value
naive_mae = np.abs(y[min_train:] - y[min_train-1:-1]).mean()
print(f"Last-value naive MAE: {naive_mae:.4f}")`,
            },
            {
              id: 3,
              cellTitle: 'AR Model and Rolling Feature Engineering',
              prose: [
                `A pure Autoregressive (AR) model is linear regression on lag features. AR(p) uses the last p values: y[t] = w₁y[t−1] + w₂y[t−2] + ... + wₚy[t−p] + b. Solved with normal equations: w = (XᵀX)⁻¹Xᵀy.`,
                `Rolling features give the model information about recent trend and volatility that lag features alone don't capture. Rolling mean(7): average of last 7 values — a trend indicator. Rolling std(7): volatility over last 7 values. Rolling min/max: range of recent values.`,
                `We compare AR(5) alone vs AR(5) + rolling features on a seasonal series. Rolling features usually help when the series has clear trend or volatility patterns.`,
              ],
              code: `import numpy as np

rng = np.random.default_rng(3)
N = 400
t = np.arange(N)
# Series: trend + seasonality + AR(1) noise
ar_noise = np.zeros(N)
for i in range(1, N): ar_noise[i] = 0.7*ar_noise[i-1] + rng.normal(0, 0.3)
series = 0.02*t + np.sin(2*np.pi*t/30) + ar_noise

K = 5  # lags
W_roll = 7  # rolling window

def make_features(s, k, w_roll):
    n = s.shape[0]
    start = max(k, w_roll)
    X_lag = np.column_stack([s[start-j-1:n-j-1] for j in range(k)])
    # Rolling stats computed strictly before each time step
    r_mean = np.array([s[max(0,i-w_roll):i].mean() for i in range(start, n)])
    r_std  = np.array([s[max(0,i-w_roll):i].std()  for i in range(start, n)])
    y = s[start:]
    return X_lag, np.column_stack([X_lag, r_mean, r_std]), y

X_lag, X_full, y = make_features(series, K, W_roll)
n = len(y)
min_train = int(0.6*n)

def ridge_eval(X, y, alpha=0.5):
    maes = []
    step = (n - min_train) // 5
    for i in range(5):
        tr_end = min_train + i*step
        te_end = min(tr_end+step, n)
        if tr_end >= n: break
        w = np.linalg.solve(X[:tr_end].T@X[:tr_end]+alpha*np.eye(X.shape[1]),X[:tr_end].T@y[:tr_end])
        maes.append(np.abs(X[tr_end:te_end]@w - y[tr_end:te_end]).mean())
    return np.mean(maes)

mae_lag  = ridge_eval(X_lag, y)
mae_full = ridge_eval(X_full, y)
naive = np.abs(y[min_train:] - y[min_train-1:-1]).mean()

print(f"AR(5) lags only:          MAE = {mae_lag:.4f}")
print(f"AR(5) + rolling features: MAE = {mae_full:.4f}")
print(f"Last-value naive:         MAE = {naive:.4f}")
print(f"\\nRolling features improvement: {mae_lag - mae_full:.4f}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: `Implement a multi-step recursive forecaster. Given a trained AR model with K lag features, predict h=5 steps ahead by: (1) predicting step t+1 from lags, (2) using the prediction as the new lag-1 for step t+2, and so on. Compare this recursive 5-step forecast to predicting directly using 5 separate models (one for each horizon). Report MAE at each horizon for both strategies.`,
              starterCode: `import numpy as np

rng = np.random.default_rng(7)
N = 500
ar_series = np.zeros(N)
for i in range(1, N): ar_series[i] = 0.8*ar_series[i-1] + rng.normal(0, 0.5)

K = 5  # lag order
H = 5  # forecast horizon

def ridge_fit(X, y, alpha=0.1):
    return np.linalg.solve(X.T@X + alpha*np.eye(X.shape[1]), X.T@y)

def make_lags(s, k):
    n = len(s)
    X = np.column_stack([s[k-j-1:n-j-1] for j in range(k)])
    return X, s[k:]

split = 400

# TODO: implement recursive forecasting:
#   For each test point t, use the last K values, predict 1 step ahead,
#   append to the "known" series, predict step 2, etc.
#   Track MAE at each horizon h=1..5

# TODO: implement direct forecasting:
#   For horizon h, create training rows where:
#     features = [y[i-K], ..., y[i-1]]  (K lags)
#     target   = y[i+h-1]               (h steps ahead)
#   Train a separate ridge model for each h
#   Track MAE at each horizon h=1..5

# TODO: print comparison table
print(f"{'Horizon':>8}  {'Recursive MAE':>14}  {'Direct MAE':>12}")`,
              hint: `For recursive: maintain a buffer = last K values from training. Predict next value, push to buffer (drop oldest). Repeat. For direct: target = series[K+h-1:], features = lag matrix of series[0:N-h].`,
              testCode: `# Direct forecasting should outperform recursive at longer horizons (h≥3)`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'ae2-15-q1',
      type: 'choice',
      question: `Why is a random train/test split invalid for time series data?`,
      options: [
        'Random splits make the dataset too small',
        'Random splits leak future information into the training set, allowing the model to learn from the future',
        'Time series data cannot be split at all',
        'Random splits only work for classification problems',
      ],
      answer: 'Random splits leak future information into the training set, allowing the model to learn from the future',
      hints: ['In a random split, future data points can end up in training while past points are in test. The model uses future info to predict the past — false optimism.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-15-q2',
      type: 'choice',
      question: `What does it mean for a time series to be stationary?`,
      options: [
        'The values never change over time',
        'Its statistical properties (mean, variance, autocorrelation) do not change over time',
        'It has no seasonal patterns',
        'It always trends upward',
      ],
      answer: 'Its statistical properties (mean, variance, autocorrelation) do not change over time',
      hints: ['Stationarity means the underlying distribution doesn\'t drift. A trending series has non-constant mean → non-stationary.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-15-q3',
      type: 'choice',
      question: `What is the purpose of differencing a time series?`,
      options: [
        'To increase the number of data points',
        'To remove trend and make the series stationary by modeling changes between consecutive values',
        'To convert regression into classification',
        'To normalize the values between 0 and 1',
      ],
      answer: 'To remove trend and make the series stationary by modeling changes between consecutive values',
      hints: ['diff[t] = y[t] − y[t−1]. This removes linear trend. Second differencing removes quadratic trend.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-15-q4',
      type: 'choice',
      question: `Lag features convert a time series into a supervised learning problem. What is a lag-3 feature for predicting y[t]?`,
      options: [
        'The average of the next 3 values: (y[t+1] + y[t+2] + y[t+3]) / 3',
        'The value 3 time steps ago: y[t−3]',
        'The 3rd derivative of the series',
        'The difference between the current value and 3 steps ahead',
      ],
      answer: 'The value 3 time steps ago: y[t−3]',
      hints: ['Lag-k feature = y[t−k]. Past values as features let standard ML models do time series prediction.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-15-q5',
      type: 'choice',
      question: `Walk-forward validation uses expanding or sliding windows. Why is it better than K-fold CV for time series?`,
      options: [
        'Walk-forward is faster to compute',
        'Walk-forward respects temporal order, training only on past data and testing on future data, preventing lookahead bias',
        'K-fold CV cannot be used on numeric data',
        'Walk-forward uses more data for training',
      ],
      answer: 'Walk-forward respects temporal order, training only on past data and testing on future data, preventing lookahead bias',
      hints: ['K-fold shuffles data, potentially training on the future to predict the past. Walk-forward always: train on past, test on future.'],
      reviewSection: 'intuition',
    },
  ],
};

export default lesson;
