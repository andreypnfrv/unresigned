"use client";

import React from 'react';
import SingleColumnSection from "../common/SingleColumnSection";
import ShortformThreadList from "./ShortformThreadList";
import SectionTitle from "../common/SectionTitle";

const ShortformPage = () => {
  return (
    <SingleColumnSection>
      <SectionTitle title={"Quick Takes"} />
      <ShortformThreadList />
    </SingleColumnSection>
  )
}

export default ShortformPage;

