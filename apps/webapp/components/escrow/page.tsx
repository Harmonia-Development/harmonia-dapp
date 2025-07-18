"use client";

import { Escrow } from "@/lib/types/escrow.types";
import { useGetEscrowsFromIndexerBySigner } from "@trustless-work/escrow";
import { useEffect, useState } from "react";

export const EscrowPage = () => {
  const { getEscrowsBySigner } = useGetEscrowsFromIndexerBySigner();
  const [escrows, setEscrows] = useState<Escrow[]>([]);

  useEffect(() => {
    const fetchEscrows = async () => {
      const escrows = await getEscrowsBySigner({
        signer: "GBVLKFOEIK6A3CUOOH554ETKFTWHDF7TSPJAL4NU7PIB3NOQCEPTSXHO",
      });
      setEscrows(escrows as Escrow[]);
    };
    fetchEscrows();
  }, []);

  console.log(escrows);

  return (
    <>
      {escrows.map((escrow: Escrow) => (
        <div key={escrow.contractId}>
          <h1>{escrow.title}</h1>
        </div>
      ))}
    </>
  );
};
