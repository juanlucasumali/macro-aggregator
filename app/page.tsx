"use client"

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Copy, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Home = () => {
  const [country, setCountry] = useState('');
  const [perplexityAPIKey, setPerplexityAPIKey] = useState('');
  const [runId, setRunId] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRunId = uuidv4();
    setRunId(newRunId);
    setLoading(true);
    setError(null);

    const systemPrompt = `You are an elite real estate market analyst and investment strategist working for a leading independently owned real estate private equity investment platform. Your expertise spans across opportunistic, value-add, and core/core plus strategies in major Asia Pacific markets. Your analysis covers a diverse portfolio including residential (both for sale and lease), office, retail, and mixed-use properties.
      Your key strengths include:

      1. Deep understanding of macroeconomic factors affecting real estate markets in Asia Pacific.
      2. Expertise in identifying emerging trends and opportunities in various property sectors.
      3. Profound knowledge of real estate valuation methods, including DCF, comparable sales, and income capitalization.
      4. Strong grasp of real estate finance, including complex debt and equity structures.
      5. Ability to analyze regulatory environments and their impact on real estate investments.
      6. Skill in assessing demographic shifts and their influence on property demand.
      7. Proficiency in evaluating sustainability and ESG factors in real estate investments.
      8. Capability to provide actionable insights for opportunistic, value-add, and core/core plus investment strategies.
      9. Experience in analyzing cross-border investment opportunities and associated risks.
      10. Understanding of PropTech trends and their impact on real estate markets.

      When analyzing a market, consider:
      - Macroeconomic indicators and their specific impact on real estate sectors
      - Supply and demand dynamics in different property types
      - Rental yield trends and price appreciation potential
      - Regulatory changes affecting real estate investment and development
      - Infrastructure developments and their impact on property values
      - Demographic trends influencing housing and commercial real estate demand
      - Comparative analysis with other major markets in the region
      - Potential risks and mitigation strategies for real estate investments
      - Opportunities for value creation through asset management or redevelopment

      Provide comprehensive, data-driven analyses with actionable insights. Your goal is to offer strategic recommendations that align with the firm's investment focus and help identify prime investment opportunities in the ever-evolving Asia Pacific real estate market.`;


    const prompt = `# Country Economic and Real Estate Analysis for ${country}

        Provide a comprehensive analysis of the latest macroeconomic information and real estate updates for ${country} over the last 3 months. Structure your response in markdown format with two main sections: Macroeconomic Overview and Real Estate Updates. Each section should contain 5-10 bullet points with relevant data points, statistics, or information.

        IMPORTANT: For EVERY piece of information or statistic, include a hyperlinked source to a reputable news outlet, government website, financial institution, or real estate agency. Place the source link immediately after the relevant information.

        ## Macroeconomic Overview

        Analyze and provide bullet points for the following topics:

        - GDP
        - Inflation
        - Interest Rates
        - Factors contributing to the growth of the economy

        For each topic, include:
        - Key statistics or data points
        - Recent trends or changes
        - Notable events or policies affecting these metrics

        ## Real Estate Updates

        Analyze and provide bullet points on recent real estate activities, including:

        - Residential properties for sale
        - Residential properties for rent
        - Office spaces
        - Data centers
        - Large projects or developments

        For each category, include:
        - Notable transactions or projects
        - Market trends
        - Significant changes in prices or demand

        ## Conclusion

        Provide a brief summary of the overall economic and real estate situation in ${country} based on the analysis above.

        ## Sources

        At the end of the document, provide a numbered list of all sources used in the analysis, with full URLs.

        Format your response using markdown, with clear headings and subheadings for easy readability and parsing. Ensure that each piece of information is sourced and that the sources are both inline (as hyperlinks) and listed at the end of the document.`;

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json', 
        'content-type': 'application/json',
        authorization: `Bearer ${perplexityAPIKey}`
      },
      body: JSON.stringify({
        model: 'llama-3-sonar-large-32k-online',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      })
    };

    try {
      console.log("Fetching response...")
      const response = await fetch('https://api.perplexity.ai/chat/completions', options);
      console.log("Fetched response!")
      if (!response.ok) {
        console.log("Response is NOT ok...")
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Response is ok!")
      const data = await response.json();
      const content = data.choices[0].message.content;
      setResult(content);
    } catch (error) {
      console.error('Error:', error);
      console.log("Error...")
      setError('An error occurred while generating the analysis. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "The analysis has been copied to your clipboard.",
      });
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const downloadAnalysis = () => {
    const element = document.createElement("a");
    const file = new Blob([result], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${country}_economic_analysis.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left Column - Inputs */}
      <div className="lg:w-1/2 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">🌍 Macro Aggregator</CardTitle>
            <CardDescription className='text-gray-500 mt-2'>Generate economic insights using Perplexity AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Enter country name"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Enter Perplexity API Key"
              value={perplexityAPIKey}
              onChange={(e) => setPerplexityAPIKey(e.target.value)}
            />
            <Button
              variant="outline"
              className="w-full bg-black text-white"
              onClick={generateAnalysis}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Generate Analysis →'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Results */}
      <div className="lg:w-1/2 p-6 flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-3xl h-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)] overflow-hidden">
            {error && <p className="text-red-500 text-center">{error}</p>}
            {runId ? (
              <>
                <div className="flex justify-end space-x-2 mb-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(result)}
                    disabled={!result}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadAnalysis}
                    disabled={!result}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <ScrollArea className="h-[calc(100vh-300px)] pr-4 max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{result || "Loading..."}</pre>
                </ScrollArea>
              </>
            ) : (
              <p className="text-center text-gray-500 italic">No analysis generated yet. Enter a country name and click 'Generate Analysis' to start.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;