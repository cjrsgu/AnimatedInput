import React, { Component, createRef } from 'react';
import { Animated, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default class Akira extends Component {
  static defaultProps = {
    borderColor: '#7A7593',
    labelHeight: 24,
    inputPadding: 16,
    height: 48,
    animationDuration: 200,
  };

  constructor(props) {
    super(props);

    this.input = createRef();
    this._onLayout = this._onLayout.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this.focus = this.focus.bind(this);

    const value = props.value || props.defaultValue;

    this.state = {
      value,
      focusedAnim: new Animated.Value(value ? 1 : 0),
      width: null,
      label: props.label,
      isActive: false,
    };
  }

  componentWillReceiveProps(newProps) {
    const newValue = newProps.value;
    if (newProps.hasOwnProperty('value') && newValue !== this.state.value) {
      this.setState({
        value: newValue,
      });

      // animate input if it's active state has changed with the new value
      // and input is not focused currently.
      const isFocused = this.inputRef().isFocused();
      if (!isFocused) {
        const isActive = Boolean(newValue);
        if (isActive !== this.isActive) {
          this._toggle(isActive);
        }
      }
    }
  }

  _onLayout(event) {
    this.setState({
      width: event.nativeEvent.layout.width,
    });
  }

  _onChange(event) {
    this.setState({
      value: event.nativeEvent.text,
    });

    const onChange = this.props.onChange;
    if (onChange) {
      onChange(event);
    }
  }

  _onBlur(event) {
    if (!this.state.value) {
      this._toggle(false);
    }

    const onBlur = this.props.onBlur;
    if (onBlur) {
      onBlur(event);
    }
  }

  _onFocus(event) {
    this._toggle(true);

    const onFocus = this.props.onFocus;
    if (onFocus) {
      onFocus(event);
    }
  }

  _toggle(isActive) {
    const { animationDuration, easing, useNativeDriver, label } = this.props;
    // if (isActive) {
    //   this.setState({label: label.trim().toUpperCase()})
    // } else {
    //   this.setState({label})
    // }
    this.setState({isActive})
    this.isActive = isActive;
    Animated.timing(this.state.focusedAnim, {
      toValue: isActive ? 1 : 0,
      duration: animationDuration,
      easing,
      useNativeDriver,
    }).start();
  }

  // public methods

  inputRef() {
    return this.input.current;
  }

  focus() {
    if (this.props.editable !== false) {
      this.inputRef().focus();
    }
  }

  blur() {
    this.inputRef().blur();
  }

  isFocused() {
    return this.inputRef().isFocused();
  }

  clear() {
    this.inputRef().clear();
  }

  render() {
    const {
      style: containerStyle,
      height: inputHeight,
      labelHeight,
      inputPadding,
      inputStyle,
      labelStyle,
      borderColor,
    } = this.props;
    const {
      width,
      focusedAnim,
      value,
      label,
      isActive,
    } = this.state;

    return (
      <View style={containerStyle} onLayout={this._onLayout}>
        <TouchableWithoutFeedback onPress={this.focus}>
          <Animated.View
            style={{
              width,
              zIndex: 100,
              height: labelHeight,
              transform: [
                {
                  translateY: focusedAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [labelHeight + inputPadding - 5, 1],
                  }),
                },
              ],
            }}
          >
            <Animated.Text style={[
              {
                fontSize: focusedAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 14],
                }),
                textTransform: isActive ? 'capitalize' : null,
              },
              styles.label,
              labelStyle,
            ]}
            >
              {label}
            </Animated.Text>
          </Animated.View>
        </TouchableWithoutFeedback>
        <TextInput
          ref={this.input}
          {...this.props}
          style={[
            styles.textInput,
            inputStyle,
            {
              width,
              height: inputHeight,
              paddingHorizontal: inputPadding,
              zIndex: 200,
            },
          ]}
          value={value}
          onBlur={this._onBlur}
          onChange={this._onChange}
          onFocus={this._onFocus}
          underlineColorAndroid={'transparent'}
        />
        <View
          style={{
            position: 'absolute',
            borderWidth: 5,
            top: labelHeight / 2,
            zIndex: 0,
            width,
            borderRadius: 15,
            height: inputHeight + labelHeight / 2,
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  label: {
    backgroundColor: 'white',
    zIndex: 300,
    fontWeight: 'bold',
    color: '#cc6055',
    paddingHorizontal: 10,
    marginLeft: 15,
    textAlign: 'center',
    alignSelf: 'flex-start',
    borderRadius: 6,
  },
  textInput: {
    padding: 0,
    color: 'black',
    fontSize: 18,
    textAlign: 'left',
  },
});
