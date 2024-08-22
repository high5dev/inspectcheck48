OUTPUT=$(grep -r "interpolateNode: interpolate" ./node_modules/react-navigation-drawer/lib/module/views/Drawer.js)
if [ -z "$OUTPUT" ]
then
    echo "interpolateNode: interpolate not found - Updating..."
    cp ./node_modules/react-navigation-drawer/lib/module/views/Drawer.js ./node_modules/react-navigation-drawer/lib/module/views/Drawer.js.bak
    sed s/interpolate\,/interpolateNode\:\ interpolate\,/g ./node_modules/react-navigation-drawer/lib/module/views/Drawer.js.bak > ./node_modules/react-navigation-drawer/lib/module/views/Drawer.js
else
    echo "interpolateNode: interpolate found - No update needed"
fi

echo "@react-navigation/native/src/createKeyboardAwareNavigator.js"
OUTPUT=$(grep -r "TextInput\.State\.currentlyFocusedField\(\)" ./node_modules/\@react-navigation/native/src/createKeyboardAwareNavigator.js)
if [ -z "$OUTPUT" ]
then
    echo "TextInput.State.currentlyFocusedField() not found - No update needed"

else
    echo "TextInput.State.currentlyFocusedField() found - Updating..."
    cp ./node_modules/\@react-navigation/native/src/createKeyboardAwareNavigator.js ./node_modules/\@react-navigation/native/src/createKeyboardAwareNavigator.js.bak
    sed s/TextInput\.State\.currentlyFocusedField\(\)/TextInput\.State\.currentlyFocusedInput\(\)/g ./node_modules/\@react-navigation/native/src/createKeyboardAwareNavigator.js.bak > ./node_modules/\@react-navigation/native/src/createKeyboardAwareNavigator.js
fi

#echo "react-native-keyboard-avoiding-scroll-view/dist/KeyboardAvoidingContainer.js"
#OUTPUT=$(grep -r "NativeTextInput\.State\.currentlyFocusedField\(\)" ./node_modules/react-native-keyboard-avoiding-scroll-view/dist/KeyboardAvoidingContainer.js)
#if [ -z "$OUTPUT" ]
#then
#    echo "NativeTextInput.State.currentlyFocusedField() not found - No update needed"
#
#else
#    echo "NativeTextInput.State.currentlyFocusedField() found - Updating..."
#    cp ./node_modules/react-native-keyboard-avoiding-scroll-view/dist/KeyboardAvoidingContainer.js ./node_modules/react-native-keyboard-avoiding-scroll-view/dist/KeyboardAvoidingContainer.js.bak
#    sed s/NativeTextInput\.State\.currentlyFocusedField\(\)/NativeTextInput\.State\.currentlyFocusedInput\(\)/g ./node_modules/react-native-keyboard-avoiding-scroll-view/dist/KeyboardAvoidingContainer.js.bak > ./node_modules/react-native-keyboard-avoiding-scroll-view/dist/KeyboardAvoidingContainer.js
#fi