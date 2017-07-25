import re
import psutil
import misc
import socket
from mylogger import iotlogger

###
# This script will return storage, memory and cpu usage ONLY
# Nurvirta Monarizqa / nm2773 / July 25, 2017
###

logger = iotlogger(loggername="DevStatus")

def handle_exception(function):
    def wrapper_function(*args, **kwargs):
        try:
            return function(*args, **kwargs)
        except Exception as e:
            logger.error("Error with " + str(function.func_name) + ":" + str(e), exc_info=True)
            return {}
    return wrapper_function

@handle_exception
def storageStats():
    logger.debug('Obtaining storagestats')
    root_usage = psutil.disk_usage("/").percent
    storage_stats = {'storage_root': root_usage}
    return storage_stats

@handle_exception
def cpuStats():
    logger.debug('Obtaining cpustats')
    cpu_stats = {'cpu_load': psutil.cpu_percent(percpu=False)}
    return cpu_stats

@handle_exception
def memoryStats():
    logger.debug('Obtaining memstats')
    mem = psutil.virtual_memory()
    mem_percent = mem.percent
    mem_stats = {'mem_percent': mem_percent}
    return mem_stats

def stats():
    cpu_stats = cpuStats()
    mem_stats = memoryStats()
    storage_stats = storageStats()
    status_ping = {}
    status_ping.update(cpu_stats)
    status_ping.update(mem_stats)
    status_ping.update(storage_stats)
    return status_ping
