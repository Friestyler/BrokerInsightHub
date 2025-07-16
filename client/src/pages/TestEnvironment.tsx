/**
 * TEST ENVIRONMENT PAGE - BYPASS LOGIN FOR TESTING
 * 
 * Direct access to test environment functionality
 */

import { useEffect, useState } from 'react';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { stableEnvironmentSwitch, initializeStableEnvironment } from '@/utils/stableEnvironmentSwitch';
import { runComprehensiveDiagnostic } from '@/utils/environmentDiagnostics';
import "@/utils/consoleCommands";
import "@/utils/nuclearCacheDestroy";

export default function TestEnvironment() {
  const { environment, setEnvironment, environments } = useEnvironment();
  const [override, setOverride] = useState<(() => void) | null>(null);
  const [currentState, setCurrentState] = useState<any>(null);

  // Auto-login on mount
  useEffect(() => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'admin');
    localStorage.setItem('userId', '1');
    localStorage.setItem('userName', 'Test User');
    
    // Initialize stable environment to nn
    const stopOverride = initializeStableEnvironment('nn');
    setOverride(() => stopOverride);
    
    // Run diagnostic
    setTimeout(() => {
      runComprehensiveDiagnostic();
      updateCurrentState();
    }, 1000);
    
    return () => {
      if (override) override();
    };
  }, []);

  const updateCurrentState = () => {
    const storedEnv = localStorage.getItem('selectedEnvironment');
    const logoElements = document.querySelectorAll('[data-environment-logo]');
    const nameElements = document.querySelectorAll('[data-environment-name]');
    
    setCurrentState({
      storedEnvironment: storedEnv,
      logoElements: Array.from(logoElements).map(el => ({
        src: (el as HTMLImageElement).src,
        alt: (el as HTMLImageElement).alt
      })),
      nameElements: Array.from(nameElements).map(el => ({
        text: el.textContent
      }))
    });
  };

  const testEnvironmentSwitch = (envId: string) => {
    console.log(`🧪 TESTING STABLE ENVIRONMENT SWITCH TO: ${envId}`);
    if (override) override();
    
    // Use stable environment switch
    stableEnvironmentSwitch(envId);
    
    setTimeout(() => {
      updateCurrentState();
      runComprehensiveDiagnostic();
    }, 500);
  };

  const runNuclearReset = () => {
    console.log('💥 RUNNING NUCLEAR RESET');
    (window as any).nuclearCacheDestroy();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Environment Testing Dashboard</CardTitle>
            <CardDescription>
              Direct testing interface for environment switching without login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Current Environment Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-semibold mb-2">Current Environment</h3>
                <div className="flex items-center space-x-3">
                  <img 
                    src={environment.logo} 
                    alt={environment.name}
                    className="w-12 h-12 object-contain"
                    data-environment-logo
                  />
                  <span className="font-medium" data-environment-name>
                    {environment.name}
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-semibold mb-2">Expected: Nationale Nederlanden</h3>
                <div className="text-sm text-gray-600">
                  <p>Target Environment: nn</p>
                  <p>Should show: NN Group logo</p>
                  <p>Should show: "Nationale Nederlanden" name</p>
                </div>
              </div>
            </div>

            {/* Environment Controls */}
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-semibold mb-4">Environment Controls</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {environments.map((env) => (
                  <Button
                    key={env.id}
                    variant={environment.id === env.id ? "default" : "outline"}
                    onClick={() => testEnvironmentSwitch(env.id)}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <img 
                      src={env.logo} 
                      alt={env.name}
                      className="w-4 h-4 object-contain"
                    />
                    <span>{env.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Test Controls */}
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-semibold mb-4">Test Controls</h3>
              <div className="flex space-x-3">
                <Button onClick={updateCurrentState} variant="outline">
                  Check Current State
                </Button>
                <Button onClick={() => runComprehensiveDiagnostic()} variant="outline">
                  Run Diagnostic
                </Button>
                <Button onClick={runNuclearReset} variant="destructive">
                  Nuclear Reset
                </Button>
              </div>
            </div>

            {/* Current State Display */}
            {currentState && (
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-semibold mb-2">Current State</h3>
                <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(currentState, null, 2)}
                </pre>
              </div>
            )}

            {/* Test Links */}
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-semibold mb-4">Test Links</h3>
              <div className="space-y-2">
                <a 
                  href="/broker-view/partner/1?auto-login=true&env=nn" 
                  className="block text-blue-600 hover:underline"
                >
                  Partner Detail (Broker View) - Auto-login + NN Environment
                </a>
                <a 
                  href="/partners/1?auto-login=true&env=nn" 
                  className="block text-blue-600 hover:underline"
                >
                  Partner Detail (Normal View) - Auto-login + NN Environment
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}