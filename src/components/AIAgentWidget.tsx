'use client';

import React, { useEffect, useState } from 'react';

export default function AIAgentWidget() {
  const [agentId, setAgentId] = useState<string>('');

  useEffect(() => {
    // Read configured ElevenLabs Agent ID from localStorage or environment
    const savedId = localStorage.getItem('luxeestate_elevenlabs_agent_id');
    const envId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    const active = savedId || envId || '';
    setAgentId(active);

    if (active) {
      const scriptId = 'elevenlabs-convai-widget-official';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://elevenlabs.io/convai-widget/index.js';
        script.async = true;
        script.type = 'text/javascript';
        document.body.appendChild(script);
      }
    }
  }, []);

  if (!agentId) return null;

  return React.createElement('elevenlabs-convai', { 'agent-id': agentId });
}
