pub fn pearson(x: &[f64], y: &[f64]) -> f64 {
    if x.len() != y.len() {
        panic!("Input vectors must have the same length");
    }

    let n = x.len();
    let mean_x = x.iter().sum::<f64>() / n as f64;
    let mean_y = y.iter().sum::<f64>() / n as f64;

    let xm: Vec<f64> = x.iter().map(|&xi| xi - mean_x).collect();
    let ym: Vec<f64> = y.iter().map(|&yi| yi - mean_y).collect();

    let sx: f64 = xm.iter().map(|&xi| xi * xi).sum();
    let sy: f64 = ym.iter().map(|&yi| yi * yi).sum();

    let num: f64 = xm.iter().zip(ym.iter()).map(|(&xi, &yi)| xi * yi).sum();
    let den: f64 = (sx * sy).sqrt();

    if den == 0.0 {
        panic!("Denominator is zero, cannot compute Pearson correlation");
    }

    num / den
}