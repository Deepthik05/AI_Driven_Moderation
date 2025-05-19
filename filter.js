const filter = (data) => {
    const jsonMatch = data.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return jsonMatch[1];
    }
    return data; // Fallback to raw data
  };
  
  export default filter;