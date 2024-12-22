import cv2
import numpy as np
import tensorflow as tf

from keras.models import load_model

label_dictionary = {0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F', 16: 'G', 17: 'H', 18: 'I', 19: 'J', 20: 'K', 21: 'L', 22: 'M', 23: 'N', 24: 'O', 25: 'P', 26: 'Q', 27: 'R', 28: 'S', 29: 'T', 30: 'U', 31: 'V', 32: 'W', 33: 'X', 34: 'Y', 35: 'Z', 36: 'a', 37: 'b', 38: 'd', 39: 'e', 40: 'f', 41: 'g', 42: 'h', 43: 'n', 44: 'q', 45: 'r', 46: 't'}

# read image file
img = cv2.imread('canvas/char.png')
# convert image to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
gray = 255 - gray
# resize image to 28x28 pixels
gray_resized = cv2.resize(gray, (28, 28))

# reshape image to ( , 28, 28, 1)
gray_reshaped = gray_resized.reshape(1, 28, 28, 1)

# display shape of reshaped image
print(gray_reshaped.shape)  # should output (1, 28, 28, 1) 

with tf.device('/device:cpu:0'):
    model = load_model("canvas/my_model.h5")

    y_pred_test1 = model.predict(gray_reshaped)
    print(y_pred_test1)
    output = label_dictionary[y_pred_test1.argmax()]
    print(output)
    # y_pred_test1.shape