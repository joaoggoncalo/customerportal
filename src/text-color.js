export function calculateTextColor(theColor) {
    var colorText = "text-white";
    const color=theColor.substring(1);
    var R = parseInt(color.substring(0,2),16);
    var G = parseInt(color.substring(2,4),16);
    var B = parseInt(color.substring(4,6),16);
    var aColor = Math.sqrt(R * R * .241 + G * G * .691 + B * B * .068);

    colorText = aColor < 180 ? "text-white" : "text-grey-darken-3";
    return colorText;
}