package com.sapien.vaai;

import android.widget.Toast;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import androidx.core.content.ContextCompat;

import java.util.Map;
import java.util.HashMap;

import java.io.FileInputStream;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothDevice;
import android.content.IntentFilter;
import android.content.Intent;
import java.util.Set;

import android.os.Environment;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;

import java.io.InputStream;
import java.io.OutputStream;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothSocket;
import java.io.ByteArrayOutputStream;

import android.util.Base64;
import java.util.UUID;

import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.util.Log;

import static com.sapien.vaai.OBDService.DEREGISTER_POLICY;

public class OBDModule extends ReactContextBaseJavaModule {
  private final String TAG = "[BLE]";
  private static ReactApplicationContext reactContext;

  private static final String DURATION_SHORT_KEY = "SHORT";
  private static final String DURATION_LONG_KEY = "LONG";

  private BluetoothManager bluetoothManager;
  private BluetoothAdapter bluetoothAdapter;
  private BluetoothSocket socket;
  private OutputStream os;
  private InputStream is;
  private boolean connected;
  private boolean connecting;
  private ByteArrayOutputStream baos = new ByteArrayOutputStream();

  OBDModule(ReactApplicationContext context) {
    super(context);
    reactContext = context;
  }

  @Override
  public String getName() {
    return "OBDService";
  }

  @ReactMethod
  public void discoverDevices() {
    BluetoothManager bluetoothManager = (BluetoothManager)reactContext.getSystemService(Context.BLUETOOTH_SERVICE);
    BluetoothAdapter bluetoothAdapter = bluetoothManager.getAdapter();

    BroadcastReceiver receiver = new BroadcastReceiver() {
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                // Discovery has found a device. Get the BluetoothDevice
                // object and its info from the Intent.
                BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                String deviceName = device.getName();
                String deviceHardwareAddress = device.getAddress(); // MAC address

                WritableMap map = new WritableNativeMap();
                map.putString("name", deviceName == null ? "" : deviceName);
                map.putString("id", deviceHardwareAddress);

                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("bluetoothDeviceFound", map);
                // successCallback.invoke(map);
            }
        }
    };
    IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
    reactContext.registerReceiver(receiver, filter);

    bluetoothAdapter.startDiscovery();
  }

  @ReactMethod
  public void cancelDiscovery() {
    BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    bluetoothAdapter.cancelDiscovery();
  }

  @ReactMethod
  public void pairedDevices(Callback errorCallback, Callback successCallback) {
    BluetoothManager bluetoothManager = (BluetoothManager)reactContext.getSystemService(Context.BLUETOOTH_SERVICE);
    BluetoothAdapter bluetoothAdapter = bluetoothManager.getAdapter();

    Set<BluetoothDevice> devices = bluetoothAdapter.getBondedDevices();

    WritableArray array = new WritableNativeArray();
    for (BluetoothDevice device : devices) {
      WritableMap map = new WritableNativeMap();
      String deviceName = device.getName();
      String deviceHardwareAddress = device.getAddress();

      map.putString("name", deviceName == null ? "" : deviceName);
      map.putString("id", deviceHardwareAddress);

      array.pushMap(map);
    }

    successCallback.invoke(array);
  }

  @ReactMethod
  public void pairToOBD(String address, Callback errorCallback, Callback successCallback) {
    BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);

    // Opens the pin dialog and then bonds the device
    device.createBond();

    IntentFilter intent = new IntentFilter();
    intent.addAction(BluetoothDevice.ACTION_BOND_STATE_CHANGED);

    

    BroadcastReceiver receiver = new BroadcastReceiver() {
      boolean result = false;

        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(action) && !result) {
                BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);

                switch (device.getBondState()) {
                  case BluetoothDevice.BOND_BONDED:
                  WritableMap map = new WritableNativeMap();
                  String deviceName = device.getName();
                  String deviceHardwareAddress = device.getAddress();

                  map.putString("name", deviceName == null ? "" : deviceName);
                  map.putString("id", deviceHardwareAddress);
                    successCallback.invoke(map);
                    result = true;
                    reactContext.unregisterReceiver(this);
                    
                    break;
                  case BluetoothDevice.BOND_NONE:
                  errorCallback.invoke("failed");
                  result = true;
                  reactContext.unregisterReceiver(this);
                    break;
                }
            }
        }
    };
    reactContext.registerReceiver(receiver, intent);

    
  }

  @ReactMethod
  public void getPolicyOBDData(String policyId, Callback errorCallback, Callback successCallback) {
    File path = reactContext.getFilesDir();// Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
    File file = new File(path, policyId + ".csv");

    if (file.exists()) {
      successCallback.invoke(file.getAbsolutePath());
    } else {
      errorCallback.invoke(-1); // File does not exist
    }
  }

  @ReactMethod
  public void deregisterPolicy(String policyId) {
    Intent intent = new Intent(DEREGISTER_POLICY);
    reactContext.sendBroadcast(intent);
  }

  @ReactMethod
  public void registerPolicy(String policyId, String startingDate, String endingDate, Callback errorCallback, Callback successCallback) {
    Toast.makeText(reactContext, "Connecting", Toast.LENGTH_SHORT).show();
        Intent serviceIntent = new Intent(reactContext, OBDService.class);
        serviceIntent.putExtra("policyId", policyId);
        serviceIntent.putExtra("startingDate", startingDate);
        serviceIntent.putExtra("endingDate", endingDate);
        
        ContextCompat.startForegroundService(reactContext, serviceIntent);

        BroadcastReceiver receiver = new BroadcastReceiver() {
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();

                if (OBDService.CONNECTION_SUCCESSFUL.equals(action)) {
                    Log.i(TAG, "OBD Connected");
                    successCallback.invoke("CONNECTED");
                } else if (OBDService.CONNECTION_FAILED.equals(action)) {
                    Log.i(TAG, "OBD Connection Failed");
                    errorCallback.invoke("CONNECTION_FAILED");
                } else if (OBDService.VLINK_NOT_PAIRED.equals(action)) {
                    Log.i(TAG, "OBD not paired");
                    errorCallback.invoke("NOT_PAIRED");
                }
            }
        };
  }

  private Callback connectionErrorCallback;
  private Callback connectionSuccessCallback;
  @ReactMethod
  public void connectToObd(Callback errorCallback, Callback successCallback) {
    connectionErrorCallback = errorCallback;
    connectionSuccessCallback = successCallback;

    
      if (!connected) {
        bluetoothManager = (BluetoothManager)reactContext.getSystemService(Context.BLUETOOTH_SERVICE);
        bluetoothAdapter = bluetoothManager.getAdapter();

        final Set<BluetoothDevice> devices = bluetoothAdapter.getBondedDevices();
        

        Runnable r = new Runnable() {
          @Override
            public void run() {
              boolean found = false;

              try {
              for (BluetoothDevice device : devices) {
                String name = (device.getName() == null ? "" : device.getName()).toLowerCase();
    
                if (name.equals("vlink") || name.equals("v-link")) {
                    connecting = true;
                    found = true;
                    connected = true;
                    Log.i(TAG, "Connecting to bluetooth");
                    socket = device.createInsecureRfcommSocketToServiceRecord(UUID.fromString("00001101-0000-1000-8000-00805f9b34fb"));
                    socket.connect();
                    Log.i(TAG, "Done connecting");
    
                    os = socket.getOutputStream();
                    is = socket.getInputStream();
    
                    connectionLoop();
    
                    os.write(Base64.decode("QVQgU1AgMA0=", Base64.DEFAULT)); // Initialization of OBD
    
                    break;
                }
              }
              }
              catch (Exception e) {
                connecting = false;
                errorCallback.invoke(e.getMessage());
              }
            }
        };
        
        new Thread(r).start();
      }
  }
  
  @ReactMethod
  public void disconnectFromObd() {
    connected = false;
    connecting = false;
    try {
        is.close();
        os.close();
        socket.close();
    } catch (Exception e) {

    }
  }

  private Callback sendToObdErrorCallback;
  private Callback sendToObdSuccessCallback;
  @ReactMethod
  public void sendToObd(String base64String, Callback errorCallback, Callback successCallback) {
    sendToObdErrorCallback = errorCallback;
    sendToObdSuccessCallback = successCallback;

    Runnable r = new Runnable() {
      @Override
      public void run() {
        try {
          os.write(Base64.decode(base64String, Base64.DEFAULT));
        } catch (Exception e) {
          errorCallback.invoke(e.getMessage());
        }
      }
    };

    new Thread(r).start();
    
  }
    
  private void connectionLoop() {
    try {
        Runnable r = new Runnable() {
            @Override
            public void run() {
                while (connected) {
                    try {
                        int b = is.read();
                        if (b != -1) {
                            baos.write(b);

                            String result = new String(baos.toByteArray());
                            if (result.contains(">") || result.contains("\n") || result.contains("\r")) {
                                baos.reset();

                                Log.i(TAG, result);

                                if (result.contains(">")) {
                                  if (connecting) {
                                    connectionSuccessCallback.invoke();
                                    connecting = false;
                                  } else {
                                    sendResult(result);
                                  }   
                                }
                            }

                        } else {
                            Log.i(TAG, "Nothing to read");

                            Log.i(TAG, new String(Base64.encode(baos.toByteArray(), Base64.DEFAULT)));
                        }
                    } catch (Exception e) {
                        connected = false;
                        sendToObdErrorCallback.invoke(e.getMessage());
                        try {
                            Log.i(TAG, "Attempting closing connection");
                            is.close();
                            os.close();
                            socket.close();
                        } catch (Exception ex) {
                            ex.printStackTrace();
                        }

                        e.printStackTrace();
                    }
                }
            }
        };
        new Thread(r).start();
    } catch (Exception e) {
        e.printStackTrace();
    }

  }

  private void sendResult(String result) {
    sendToObdSuccessCallback.invoke(result);
  }
}