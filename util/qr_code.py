import os
import qrcode
from dotenv import load_dotenv

load_dotenv()

img = qrcode.make(os.environ['HOST_ADDRESS'])
img.save(os.sep.join([os.path.abspath(os.curdir), 'server', 'static', 'qr.png']))
