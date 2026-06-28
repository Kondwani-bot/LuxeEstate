'use client';

import React, { useEffect, useState } from 'react';

export default function AIAgentWidget() {
  const [agentId, setAgentId] = useState<string>('agent_9001kw5mbgq3evy8szkp8wdmgjsc');

  useEffect(() => {
    // Read configured ElevenLabs Agent ID from localStorage or environment, defaulting to user's exact agent ID
    const savedId = localStorage.getItem('luxeestate_elevenlabs_agent_id');
    const envId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    const active = savedId || envId || 'agent_9001kw5mbgq3evy8szkp8wdmgjsc';
    setAgentId(active);

    if (active) {
      const scriptId = 'elevenlabs-convai-widget-official';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
        script.async = true;
        script.type = 'text/javascript';
        document.body.appendChild(script);
      }
    }
  }, []);

  if (!agentId) return null;

  return React.createElement('elevenlabs-convai', { 'agent-id': agentId });
}

