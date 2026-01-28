import React from 'react'
import { createRoot } from 'react-dom/client'
import { Deck, Slide, Heading, Text, FlexBox, Box } from 'spectacle'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const theme = {
  colors: {
    primary: '#0a0a0a',
    secondary: '#2dd4a0',
    tertiary: '#ffffff',
  },
  fonts: {
    header: "'Space Mono', monospace",
    text: "'DM Sans', sans-serif",
  },
  fontSizes: {
    h1: '72px',
    h2: '56px',
    h3: '40px',
    text: '28px',
  },
}

const replitData = [
  { year: '2023', arr: 2.4 },
  { year: '2024', arr: 13 },
  { year: '2025', arr: 253 },
]

const lovableData = [
  { year: '2023', arr: 0 },
  { year: '2024', arr: 1 },
  { year: '2025', arr: 200 },
]

function Presentation() {
  return (
    <Deck theme={theme}>
      {/* Slide 1: Bezos Quote */}
      <Slide backgroundColor="#0a0a0a">
        <FlexBox height="100%" flexDirection="column" justifyContent="center" alignItems="center">
          <Text fontSize="120px" color="#2dd4a0" fontWeight="bold" fontFamily="'Space Mono', monospace">
            2,300%
          </Text>
          <Text fontSize="32px" color="#ffffff" textAlign="center" margin="20px 100px" fontFamily="'DM Sans', sans-serif">
            In 1994, Jeff Bezos discovered internet usage was growing at 2,300% per year.
          </Text>
          <Text fontSize="40px" color="#2dd4a0" fontWeight="bold" margin="40px 0 0 0" fontFamily="'Space Mono', monospace">
            "This is Day 1 for the Internet."
          </Text>
          <Text fontSize="24px" color="#737373" margin="40px 0 0 0" fontFamily="'DM Sans', sans-serif">
            He quit his job and started Amazon.
          </Text>
        </FlexBox>
      </Slide>

      {/* Slide 2: ARR Growth Charts */}
      <Slide backgroundColor="#0a0a0a">
        <Heading fontSize="48px" color="#ffffff" margin="0 0 20px 0" fontFamily="'Space Mono', monospace">
          AI Code Generation is Exploding
        </Heading>
        <FlexBox justifyContent="space-around" alignItems="center" height="80%">
          <Box width="45%" height="400px">
            <Text fontSize="28px" color="#2dd4a0" textAlign="center" fontWeight="bold" margin="0 0 10px 0" fontFamily="'Space Mono', monospace">
              Replit ARR
            </Text>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={replitData}>
                <defs>
                  <linearGradient id="replitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4a0" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2dd4a0" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="year" stroke="#737373" fontSize={18} fontFamily="'DM Sans', sans-serif" />
                <YAxis stroke="#737373" fontSize={16} tickFormatter={(v) => `$${v}M`} fontFamily="'DM Sans', sans-serif" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif" }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`$${value}M`, 'ARR']}
                />
                <Area type="monotone" dataKey="arr" stroke="#2dd4a0" strokeWidth={3} fill="url(#replitGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
          <Box width="45%" height="400px">
            <Text fontSize="28px" color="#2dd4a0" textAlign="center" fontWeight="bold" margin="0 0 10px 0" fontFamily="'Space Mono', monospace">
              Lovable ARR
            </Text>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lovableData}>
                <defs>
                  <linearGradient id="lovableGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4a0" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2dd4a0" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="year" stroke="#737373" fontSize={18} fontFamily="'DM Sans', sans-serif" />
                <YAxis stroke="#737373" fontSize={16} tickFormatter={(v) => `$${v}M`} fontFamily="'DM Sans', sans-serif" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif" }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`$${value}M`, 'ARR']}
                />
                <Area type="monotone" dataKey="arr" stroke="#2dd4a0" strokeWidth={3} fill="url(#lovableGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </FlexBox>
      </Slide>

      {/* Slide 3: Industry Growth */}
      <Slide backgroundColor="#0a0a0a">
        <FlexBox height="100%" flexDirection="column" justifyContent="center" alignItems="center">
          <Text fontSize="32px" color="#737373" margin="0 0 20px 0" fontFamily="'DM Sans', sans-serif">
            AI Website Generation Industry
          </Text>
          <Text fontSize="180px" color="#2dd4a0" fontWeight="bold" fontFamily="'Space Mono', monospace">
            3,100%
          </Text>
          <Text fontSize="36px" color="#ffffff" margin="20px 0 0 0" fontFamily="'DM Sans', sans-serif">
            Combined ARR growth (2024 → 2025)
          </Text>
          <Text fontSize="24px" color="#737373" margin="30px 0 0 0" fontFamily="'DM Sans', sans-serif">
            Replit + Lovable: $14M → $453M in one year
          </Text>
        </FlexBox>
      </Slide>

      {/* Slide 4: What We Are */}
      <Slide backgroundColor="#0a0a0a">
        <FlexBox height="100%" flexDirection="column" justifyContent="center" alignItems="center">
          <Text fontSize="48px" color="#2dd4a0" fontWeight="bold" margin="0 0 50px 0" fontFamily="'Space Mono', monospace">
            What are we?
          </Text>
          <Text fontSize="36px" color="#ffffff" textAlign="center" margin="0 80px" fontFamily="'DM Sans', sans-serif">
            When the barrier to create a website becomes <span style={{color: '#2dd4a0'}}>10x lower</span>
          </Text>
          <Text fontSize="36px" color="#ffffff" textAlign="center" margin="20px 80px" fontFamily="'DM Sans', sans-serif">
            The odds of bugs being introduced is <span style={{color: '#2dd4a0'}}>10x higher</span>
          </Text>
          <Text fontSize="32px" color="#737373" margin="50px 0 0 0" fontFamily="'DM Sans', sans-serif">
            We capitalize on that market shift.
          </Text>
        </FlexBox>
      </Slide>

      {/* Slide 5: Bugable */}
      <Slide backgroundColor="#0a0a0a">
        <FlexBox height="100%" flexDirection="column" justifyContent="center" alignItems="center">
          <Text fontSize="96px" color="#ffffff" fontWeight="bold" fontFamily="'Space Mono', monospace">
            Bugable
          </Text>
          <Text fontSize="32px" color="#2dd4a0" textAlign="center" margin="30px 100px" fontFamily="'DM Sans', sans-serif">
            An AI platform that continuously QA tests your website like a human would.
          </Text>
          <Text fontSize="28px" color="#737373" margin="20px 0 0 0" fontFamily="'DM Sans', sans-serif">
            Find UX/UI and security bugs.
          </Text>
        </FlexBox>
      </Slide>

      {/* Slide 6: Live Demo */}
      <Slide backgroundColor="#0a0a0a">
        <FlexBox height="100%" flexDirection="column" justifyContent="center" alignItems="center">
          <Text fontSize="120px" color="#2dd4a0" fontWeight="bold" fontFamily="'Space Mono', monospace">
            Live demo!
          </Text>
        </FlexBox>
      </Slide>

    </Deck>
  )
}

createRoot(document.getElementById('root')).render(<Presentation />)
