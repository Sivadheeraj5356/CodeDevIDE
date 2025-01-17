import React from 'react'
import { ConvexProvider } from 'convex-react'
import ConvexReactClient from 'convex-react-client'
const ConvexClientProvider = ({children}) => {
    const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

  return (
    <div>
        <ConvexProvider client={convex}>{children}</ConvexProvider>;
    </div>
  )
}

export default ConvexClientProvider