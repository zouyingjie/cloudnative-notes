可观测性（Observability）一词来源于控制论，本义是“可以由系统的外部输出推断其内部状态的程度”。

> In control theory, "observability is a measure of how well internal states of a system can be inferred from knowledge of its external outputs." 《Observability Whitepaper》

分布式系统，在提高系统的可用性、容量、弹性的同时，也带来了复杂度的提升，极大的提到了故障排查的难度。

在分布式系统中，出错是常态，如何快速发现问题，解决问题，是分布式系统运维的重点和难点，这一切都需要我们的系统有良好的可观测性，使我们对系统的内部状态有充分的了解。在工程实践中，我们要尽可能全面的收集系统的内部状态数据，并在清洗后进行存储，后续用来做可视化展示以及异常告警，这需要我们构建一套完整的全栈监控系统。

可观测性涉及的知识点非常庞杂，本部分不针对具体的知识点做细致讲解，只结合笔者的经验，从宏观上讨论应该如何构建一套完整的监控系统。




