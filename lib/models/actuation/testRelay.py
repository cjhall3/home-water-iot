import Adafruit_BBIO.GPIO as GPIO
from time import sleep

relay1 = "P9_12"
GPIO.setup( relay1, GPIO.OUT )

GPIO.output( relay1, GPIO.HIGH )
sleep( 4 )
GPIO.output( relay1, GPIO.LOW )
sleep( 4 )

GPIO.cleanup()
