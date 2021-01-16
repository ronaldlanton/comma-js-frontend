const setThemeVariables = (variables) => {
  variables.forEach((variable) => {
    let varName = variable.split(":")[0];
    let varValue = variable.split(":")[1];
    document.documentElement.style.setProperty(varName, varValue);
  });
};

const setTheme = (themeName) => {
  switch (themeName) {
    case "light":
      //Light theme variables
      setThemeVariables([
        "--background_color:#ebedf0",
        "--foreground_element_color:rgb(110, 110, 110)",
        "--background_alpha:255, 255, 255",
        "--split_button_background_color:rgb(255, 255, 255)",
        "--text_primary:rgb(24, 24, 24)",
        "--info_text_color:rgb(24, 24, 24)",
        "--receive_bubble_color:rgb(255, 255, 255)",
        "--receive_text_color:rgb(24, 24, 24)",
        "--sender_bubble_gradient:linear-gradient(to bottom,#00D0EA 15%,rgb(0, 140, 201) 90%)",
      ]);
      break;
    case "dark":
      setThemeVariables([
        "--background_color:#1c1b1b",
        "--foreground_element_color:rgb(60, 64, 67)",
        "--background_alpha:28, 27, 27",
        "--split_button_background_color:rgb(0, 140, 201)",
        "--text_primary:rgb(240, 240, 240)",
        "--info_text_color:rgb(228, 228, 228)",
        "--receive_bubble_color:#202020",
        "--receive_text_color:rgb(240, 240, 240)",
        "--sender_bubble_gradient:linear-gradient(to bottom,rgb(0, 140, 201) 15%,rgb(0, 80, 114) 90%)",
      ]);
      break;
    default:
    // code block
  }
};

export default setTheme;
