package com.tradespace.ai;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            android.view.Window window = getWindow();
            window.setFlags(android.view.WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED, android.view.WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED);
            android.view.Display.Mode[] modes = window.getWindowManager().getDefaultDisplay().getSupportedModes();
            android.view.Display.Mode bestMode = null;
            float maxRefreshRate = 0;

            for (android.view.Display.Mode mode : modes) {
                if (mode.getRefreshRate() > maxRefreshRate) {
                    maxRefreshRate = mode.getRefreshRate();
                    bestMode = mode;
                }
            }

            if (bestMode != null) {
                android.view.WindowManager.LayoutParams params = window.getAttributes();
                params.preferredDisplayModeId = bestMode.getModeId();
                window.setAttributes(params);
            }
        }
    }
}
