package com.sapien.vaai;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.Message;
import android.util.Base64;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.DateFormat;
import java.util.Date;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;

public class OBDService extends Service {
    private BluetoothManager bluetoothManager;
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothSocket socket;
    private boolean serviceRunning = false;
    private final String TAG = "[BLE]";

    public static String CONNECT_TO_VLINK = "CONNECT_TO_VLINK";
    public static String DISCONNECT_FROM_VLINK = "DISCONNECT_FROM_VLINK";
    public static String VLINK_NOT_PAIRED = "VLINK_NOT_PAIRED";
    public static String CONNECTION_FAILED = "VLINK_CONNECTION_FAILED";
    public static String CONNECTION_SUCCESSFUL = "VLINK_CONNECTION_SUCCESSFUL";
    public static String DEREGISTER_POLICY = "DEREGISTER_POLICY";
    public static final String CHANNEL_ID = "VaaiServiceChannel";
    // public static final String CHANNEL_ID = "OBD_SERVICE_CHANNEL";
    private boolean receivedResult = false;
    private boolean connected = false;
    private boolean shouldReconnect = true;

    private int previousSpeed = 0;

    IntentFilter intentFilter = new IntentFilter(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
    IntentFilter intentFilterConnectToVlink = new IntentFilter(OBDService.CONNECT_TO_VLINK);
    IntentFilter intentFilterdisconnectFromVlink = new IntentFilter(OBDService.DISCONNECT_FROM_VLINK);
    IntentFilter intentDeregister = new IntentFilter(OBDService.DEREGISTER_POLICY);

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    OutputStream os;
    InputStream is;

    String policyId;
    String startDate;
    String endDate;
    FileOutputStream fos;
    File file;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, 0);
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Policy is Active")
                .setContentText("Vaai is tracking your driving")
                .setTicker("You have an active policy")
               .setSmallIcon(R.drawable.ic_launcher_round)
                .setContentIntent(pendingIntent)
                .build();

        startForeground(1, notification);

        registerReceiver(receiver, intentFilter);
        registerReceiver(receiver, intentFilterConnectToVlink);
        registerReceiver(receiver, intentFilterdisconnectFromVlink);
        registerReceiver(receiver, intentDeregister);

        policyId = intent.getStringExtra("policyId");
        startDate = intent.getStringExtra("startDate");
        endDate = intent.getStringExtra("endDate");

        File path = getFilesDir();// Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        file = new File(path, policyId + ".csv");

        Log.i(TAG, "File path: " + file.getAbsolutePath());

        try {
            fos = new FileOutputStream(file, true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    

        

        if (!serviceRunning) {
            Log.i(TAG, "Service Started");
            bluetoothManager = (BluetoothManager)getSystemService(Context.BLUETOOTH_SERVICE);
            bluetoothAdapter = bluetoothManager.getAdapter();

            serviceRunning = true;
        } else {
            Log.i(TAG, "Service already running");
        }

        pollingConnection();

        //TODO do something useful
        return Service.START_REDELIVER_INTENT;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        unregisterReceiver(receiver);
        try {
            shouldReconnect = false;
            fos.close();
            file.delete();
            os.close();
            is.close();
            socket.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void pollingConnection() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                while (shouldReconnect) {
                    if (!connected) {
                        connectToVlink();
                    }

                    try {
                        Thread.sleep(30000);
                    } catch (Exception e) {

                    }
                    
                }
            }
        }).start();
        
    }

    TimerTask task;
    private void connectionLoop() {
        try {
            String date = DateFormat.getDateTimeInstance().format(new Date()).replace(':', '-');
            

            final Handler handler = new Handler(Looper.getMainLooper()) {
                @Override
                public void handleMessage(Message message) {
                    // This is where you do your work in the UI thread.
                    // Your worker tells you in the message what to do.
                }
            };
            final int delay = 1000;

            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    if (receivedResult) {
                        receivedResult = false;
                        try {
                            Log.i(TAG, "Getting Speed");
                            os.write(Base64.decode("MDEgMEQN", Base64.DEFAULT));
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }

                    if (connected) {
                        handler.postDelayed(this, delay);
                    }

                }
            }, delay);

            Runnable r = new Runnable() {
                @Override
                public void run() {
                    while (connected) {
                        try {
                            int b = is.read();
                            if (b != -1) {
                                baos.write(b);
//                                        Log.i(TAG, "Read byte");
                                String result = new String(baos.toByteArray());
                                if (result.contains(">") || result.contains("\n") || result.contains("\r")) {
                                    baos.reset();

//                                    if (result.contains("SEARCHING...")) {
//                                        int index = result.indexOf("SEARCHING...");
//                                        result = result.substring(index, "SEARCHING...".length());
//
////                                        fos.write(result.getBytes());
//
//                                    }

                                    Log.i(TAG, result);



                                    if (result.indexOf("41 0D") == 0) {
                                        String[] values = result.split(" ");
                                        int speed = Integer.parseInt(values[2], 16);
                                        double difference = (speed * 0.278) - (previousSpeed * 0.278);
                                        double gforce = difference / 9.8;

                                        String date = DateFormat.getDateTimeInstance().format(new Date());
                                        String csvString = date + ";" + speed + "km/h;" + String.format("%.2f", gforce) + "\n";
                                       fos.write(csvString.getBytes());


                                        Log.i(TAG, "Wrote to file");

                                        previousSpeed = speed;
                                    }

                                    if (result.contains(">")) {
                                        receivedResult = true;
                                    }
                                }

//                                        Log.i(TAG, new String(Base64.encode(baos.toByteArray(), Base64.DEFAULT)));
                            } else {
                                Log.i(TAG, "Nothing to read");

                                Log.i(TAG, new String(Base64.encode(baos.toByteArray(), Base64.DEFAULT)));
                            }
                        } catch (Exception e) {
                            connected = false;
                            try {
                                Log.i(TAG, "Attempting closing connection");
                                is.close();
                                os.close();
                                socket.close();
                            } catch (Exception ex) {
                                ex.printStackTrace();
                            }

                            // try {
                            //     Log.i(TAG, "Attempting reconnection");
                            //     socket.connect();

                            //     is = socket.getInputStream();
                            //     os = socket.getOutputStream();
                            // } catch (Exception ex) {
                            //     ex.printStackTrace();
                            // }
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

    private void connectToVlink() {
        connected = true;
        Runnable r = new Runnable() {
            @Override
            public void run() {
                try {
                    Set<BluetoothDevice> devices = bluetoothAdapter.getBondedDevices();
                    boolean found = false;

                    for (BluetoothDevice device : devices) {
                        String name = (device.getName() == null ? "" : device.getName()).toLowerCase();

                        if (name.equals("vlink") || name.equals("v-link")) {
                            found = true;
                            Log.i(TAG, "Connecting to bluetooth");
                            socket = device.createInsecureRfcommSocketToServiceRecord(UUID.fromString("00001101-0000-1000-8000-00805f9b34fb"));
                            socket.connect();
                            Log.i(TAG, "Done connecting");

                            os = socket.getOutputStream();
                            is = socket.getInputStream();

                            connectionLoop();

                            os.write(Base64.decode("QVQgU1AgMA0=", Base64.DEFAULT)); // Initialization of OBD

                            Intent i = new Intent();
                            i.setAction(CONNECTION_SUCCESSFUL);
                            sendBroadcast(i);

                            break;
                        }
                    }

                    if (!found) {
                        connected = false;
                        Intent i = new Intent();
                        i.setAction(VLINK_NOT_PAIRED);
                        sendBroadcast(i);
                    }
                } catch (Exception e) {
                    connected = false;
                    Intent i = new Intent();
                    i.setAction(CONNECTION_FAILED);
                    sendBroadcast(i);
                    e.printStackTrace();
                }
            }
        };

        new Thread(r).start();
    }

    private void disconnectFromVlink() {
        connected = false;
        try {
            is.close();
            os.close();
            socket.close();
        } catch (Exception e) {

        }
    }

    private final BroadcastReceiver receiver = new BroadcastReceiver() {
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(action)) {
                final int state        = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.ERROR);
                final int prevState    = intent.getIntExtra(BluetoothDevice.EXTRA_PREVIOUS_BOND_STATE, BluetoothDevice.ERROR);

                if (state == BluetoothDevice.BOND_BONDED && prevState == BluetoothDevice.BOND_BONDING) {
//
                } else if (state == BluetoothDevice.BOND_NONE && prevState == BluetoothDevice.BOND_BONDED){

                }
            } else if (CONNECT_TO_VLINK.equals(action)) {
                Log.i(TAG, "About to connect to vlink");
                connectToVlink();
            } else if (DISCONNECT_FROM_VLINK.equals(action)) {
                Log.i(TAG, "About to connect to vlink");
                disconnectFromVlink();
            } else if (DEREGISTER_POLICY.equals(action)) {
                stopSelf();
            }
        }
    };
}
