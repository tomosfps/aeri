use strsim::levenshtein;

fn calculate_similarity(input_string: &String, compare_string: &String) -> f32 {
    let distance = levenshtein(input_string, compare_string);
    let max_length = input_string.len().max(compare_string.len()) as f32;
    1.0 - (distance as f32 / max_length)
}

pub fn compare_strings(input_string: &String, vec_of_strings: Vec<&String>) -> Vec<(String, f32)> {
    let mut result = Vec::new();

    for compare_string in vec_of_strings {
        let similarity = calculate_similarity(input_string, compare_string);
        result.push((compare_string.to_string(), similarity as f32));
    }
    
    result.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
    result
}

pub fn normalize_name(name: &str) -> String {
    name.trim().to_lowercase()
}