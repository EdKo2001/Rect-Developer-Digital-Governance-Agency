import React from "react";
import { Metadata } from "next";
import Image from "next/image";

import axios from "axios";

import { DashboardLayout } from "@/components";

export const metadata: Metadata = {
  title: "Dashboard",
};

interface MetricProps {
  title: string;
  value: number | string;
  imgWidth?: number;
  imgHeight?: number;
}

async function getMetrics(): Promise<MetricProps[]> {
  "use server";

  try {
    const responses = await Promise.allSettled([
      axios.get("http://localhost:3000/api/students"),
      axios.get("http://localhost:3000/api/courses"),
      axios.get("http://localhost:3000/api/payment"),
    ]);

    const settledResponses: MetricProps[] = responses.map((response, index) => {
      if (response.status === "fulfilled") {
        const data = response.value.data;
        let value: number | string = "Failed";

        if (index === 0 || index === 1) {
          value = data.length;
        } else if (index === 2) {
          value = data.reduce(
            (acc: number, cur: { "Amount Paid": number }) =>
              (acc += +cur["Amount Paid"]),
            0,
          );
        }

        return {
          title:
            index === 0 ? "Students" : index === 1 ? "Courses" : "Payments",
          value,
        };
      } else {
        console.error(response.reason);
        return {
          title: "Failed",
          value: "Failed",
        };
      }
    });

    return settledResponses;
  } catch (error) {
    console.error(error);
    return [
      { title: "Failed", value: "Failed" },
      { title: "Failed", value: "Failed" },
      { title: "Failed", value: "Failed" },
    ];
  }
}

const MetricBlock: React.FC<MetricProps> = ({
  title,
  value,
  imgWidth,
  imgHeight,
}) => {
  const imageSrc = `/images/${title.toLowerCase()}.svg`;

  return (
    <div className="flex w-[255px] flex-col rounded-lg bg-sky-50 p-5 max-md:ml-0 max-md:mt-10 max-md:w-full max-md:pr-5">
      <Image src={imageSrc} alt={title} width={imgWidth} height={imgHeight} />
      <h3 className="mt-5 text-sm font-medium text-gray">{title}</h3>
      <p className="mt-5 text-right text-3xl font-bold text-black">{value}</p>
    </div>
  );
};

export default async function Dashboard() {
  const metrics = await getMetrics();

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-[80%] justify-evenly	  max-md:ml-0 max-md:w-full max-md:max-w-full max-md:flex-col max-md:gap-0">
        {metrics.map((metric, index) => (
          <MetricBlock
            key={index}
            title={metric.title}
            value={metric.value}
            imgWidth={
              metric.title === "Students"
                ? 48
                : metric.title === "Courses"
                ? 28
                : 35
            }
            imgHeight={
              metric.title === "Students"
                ? 38
                : metric.title === "Courses"
                ? 35
                : 40
            }
          />
        ))}
      </div>
    </DashboardLayout>
  );
}
