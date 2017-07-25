import json
import pycurl
import cStringIO
import devstatus
from mylogger import iotlogger

###
# This script will get storage, memory and cpu usage from devstats.py
# and upload the data to the server to visualize them
# Nurvirta Monarizqa / nm2773 / July 25, 2017
###

logger = iotlogger(loggername="Uploader")


def getStatus():
    """
    Obtain device status from devstasts
    Returns
    -------
    status_ping
        json dump of dictionary contatining status
        of the device
    """
    try:
        return devstatus.stats()
    except Exception as ex:
        logger.error("Could not obtain Device Status: "+str(ex))

def uploadStatus(status, server="http://192.168.1.100:8888/status_upload"):
    """
    Upload Status
    Parameters
    ----------
    status: json dump
        json.dumps(<status_str / dict>)
    server: str
        full uri of the server location to upload to
    """
    logger.debug("Uploading Status")
    c = pycurl.Curl()
    response = cStringIO.StringIO()
    c.setopt(pycurl.URL, server)
    c.setopt(pycurl.TIMEOUT, 5)
    c.setopt(
        pycurl.HTTPHEADER, [
            'id: ' + 'nm2773'])
    c.setopt(pycurl.POST, 1)
    c.setopt(pycurl.POSTFIELDS, status)
    c.setopt(pycurl.WRITEFUNCTION, response.write)
    c.perform()
    if response.getvalue() == 'OK':
        logger.info('Uploaded Device Status')
